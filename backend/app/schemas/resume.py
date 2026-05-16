from pydantic import BaseModel
from datetime import datetime

class ResumeOut(BaseModel):
    id: int
    user_id: int
    filename: str
    is_primary: bool
    created_at: datetime
    model_config = {"from_attributes": True}

class ResumeDetailOut(ResumeOut):
    content_text: str | None