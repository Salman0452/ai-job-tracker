from pydantic import BaseModel, EmailStr
from app.models.user import UserRole
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    role: UserRole
    is_active: bool
    is_email_verified: bool
    created_at: datetime
    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str

class ResendOTPRequest(BaseModel):
    email: EmailStr


class UpdateUserRequest(BaseModel):
    username: str | None = None
    password: str | None = None