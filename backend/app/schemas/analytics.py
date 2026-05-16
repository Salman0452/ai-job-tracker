from pydantic import BaseModel
from typing import Any

class StatusCount(BaseModel):
    status: str
    count: int

class SkillDemand(BaseModel):
    skill: str
    count: int

class TimelinePoint(BaseModel):
    week: str
    count: int

class AnalyticsSummary(BaseModel):
    total_applications: int
    by_status: list[StatusCount]
    average_match_score: float
    total_ai_analyses: int

class SkillsAnalytics(BaseModel):
    top_skills: list[SkillDemand]

class TimelineAnalytics(BaseModel):
    timeline: list[TimelinePoint]