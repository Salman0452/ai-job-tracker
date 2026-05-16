from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.user import UserRole

class AdminUserOut(BaseModel):
    id: int
    email: str
    username: str
    role: UserRole
    is_active: bool
    created_at: datetime
    total_applications: int = 0
    model_config = {"from_attributes": True}

class AdminUserUpdate(BaseModel):
    is_active: bool

class AdminStats(BaseModel):
    total_users: int
    active_users: int
    total_applications: int
    total_ai_analyses: int

class AdminLogOut(BaseModel):
    id: int
    admin_id: int
    action: str
    target_user_id: Optional[int]
    metadata_: Optional[dict]
    created_at: datetime
    model_config = {"from_attributes": True}