from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional
from app.models.application import ApplicationStatus

class ApplicationCreate(BaseModel):
    company_name: str
    job_title: str
    job_description: str
    job_url: Optional[str] = None
    resume_id: Optional[int] = None
    applied_date: Optional[date] = None
    notes: Optional[str] = None

class ApplicationUpdate(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    applied_date: Optional[date] = None
    notes: Optional[str] = None
    resume_id: Optional[int] = None

class ApplicationOut(BaseModel):
    id: int
    user_id: int
    company_name: str
    job_title: str
    job_url: Optional[str]
    status: ApplicationStatus
    applied_date: Optional[date]
    notes: Optional[str]
    resume_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class ApplicationDetailOut(ApplicationOut):
    job_description: str