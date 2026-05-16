from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.ai_result import ProcessingStatus

class AIResultOut(BaseModel):
    id: int
    application_id: int
    processing_status: ProcessingStatus
    match_score: Optional[int]
    jd_analysis: Optional[dict]
    match_breakdown: Optional[dict]
    skill_gaps: Optional[dict]
    cover_letter: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class AITriggerResponse(BaseModel):
    message: str
    application_id: int