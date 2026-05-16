import hashlib
import secrets
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({**data, "exp": expire}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
    
# Refresh token — long lived, random, stored in DB
def generate_refresh_token() -> str:
    return secrets.token_urlsafe(64)

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

# OTP
def generate_otp() -> str:
    return str(secrets.randbelow(900000) + 100000)  # 100000-999999

def hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode()).hexdigest()