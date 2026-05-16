from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.email_verification import EmailVerification
from app.schemas.auth import (
    UserCreate, UserOut, LoginResponse,
    VerifyEmailRequest, ResendOTPRequest
)
from app.schemas.auth import UpdateUserRequest
from app.core.security import (
    hash_password, verify_password,
    create_access_token, verify_token,
    generate_refresh_token, hash_token,
    generate_otp, hash_otp
)
from app.core.config import settings
from app.services.email_service import send_otp_email

router = APIRouter(prefix="/auth", tags=["auth"])

REFRESH_COOKIE = "refresh_token"
COOKIE_MAX_AGE = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60


def set_refresh_cookie(response: Response, token: str):
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=token,
        httponly=True,
        secure=False,        # set True in production (HTTPS)
        samesite="lax",
        max_age=COOKIE_MAX_AGE
    )


async def create_and_store_refresh_token(user_id: int, db: AsyncSession) -> str:
    raw_token = generate_refresh_token()
    token_hash = hash_token(raw_token)
    expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    refresh_token = RefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at
    )
    db.add(refresh_token)
    await db.commit()
    return raw_token


async def send_verification_otp(user: User, db: AsyncSession):
    otp = generate_otp()
    otp_hash = hash_otp(otp)
    expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    # Send email FIRST — only store if email succeeds
    try:
        await send_otp_email(user.email, user.username, otp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send verification email: {str(e)}")

    # Only store OTP after successful email send
    verification = EmailVerification(
        user_id=user.id,
        code_hash=otp_hash,
        expires_at=expires_at
    )
    db.add(verification)
    await db.commit()


@router.post("/register", response_model=UserOut, status_code=201)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    result2 = await db.execute(select(User).where(User.username == data.username))
    if result2.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=data.email,
        username=data.username,
        hashed_password=hash_password(data.password),
        is_email_verified=False
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    await send_verification_otp(user, db)
    return user


@router.post("/verify-email", response_model=LoginResponse)
async def verify_email(
    data: VerifyEmailRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_email_verified:
        raise HTTPException(status_code=400, detail="Email already verified")

    # Find latest unused, unexpired OTP
    otp_result = await db.execute(
        select(EmailVerification)
        .where(
            EmailVerification.user_id == user.id,
            EmailVerification.is_used == False,
            EmailVerification.expires_at > datetime.utcnow()
        )
        .order_by(EmailVerification.created_at.desc())
    )
    verification = otp_result.scalar_one_or_none()

    if not verification:
        raise HTTPException(status_code=400, detail="OTP expired or not found. Request a new one.")

    if verification.code_hash != hash_otp(data.code):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # Mark verified
    verification.is_used = True
    user.is_email_verified = True
    await db.commit()
    await db.refresh(user)

    # Issue tokens and log user in directly
    access_token = create_access_token({"sub": str(user.id)})
    raw_refresh = await create_and_store_refresh_token(user.id, db)
    set_refresh_cookie(response, raw_refresh)

    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.post("/resend-otp")
async def resend_otp(data: ResendOTPRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_email_verified:
        raise HTTPException(status_code=400, detail="Email already verified")

    await send_verification_otp(user, db)
    return {"message": "New OTP sent to your email"}


@router.post("/login", response_model=LoginResponse)
async def login(
    response: Response,
    form: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == form.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    if not user.is_email_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before logging in")

    access_token = create_access_token({"sub": str(user.id)})
    raw_refresh = await create_and_store_refresh_token(user.id, db)
    set_refresh_cookie(response, raw_refresh)

    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.post("/refresh", response_model=LoginResponse)
async def refresh_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    raw_token = request.cookies.get(REFRESH_COOKIE)
    if not raw_token:
        raise HTTPException(status_code=401, detail="No refresh token")

    token_hash = hash_token(raw_token)
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.is_revoked == False,
            RefreshToken.expires_at > datetime.utcnow()
        )
    )
    stored = result.scalar_one_or_none()
    if not stored:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    # Rotate — revoke old, issue new
    stored.is_revoked = True
    await db.commit()

    user_result = await db.execute(select(User).where(User.id == stored.user_id))
    user = user_result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    access_token = create_access_token({"sub": str(user.id)})
    new_raw_refresh = await create_and_store_refresh_token(user.id, db)
    set_refresh_cookie(response, new_raw_refresh)

    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    raw_token = request.cookies.get(REFRESH_COOKIE)
    if raw_token:
        token_hash = hash_token(raw_token)
        result = await db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        stored = result.scalar_one_or_none()
        if stored:
            stored.is_revoked = True
            await db.commit()

    response.delete_cookie(REFRESH_COOKIE)
    return {"message": "Logged out"}


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
async def update_me(
    data: UpdateUserRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Update username
    if data.username and data.username != current_user.username:
        # ensure uniqueness
        result = await db.execute(select(User).where(User.username == data.username))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = data.username

    # Update password
    if data.password:
        current_user.hashed_password = hash_password(data.password)

    await db.commit()
    await db.refresh(current_user)
    return current_user