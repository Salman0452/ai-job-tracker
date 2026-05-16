import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Text, Integer, ForeignKey, DateTime, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.application import Application

class ProcessingStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"

class AIResult(Base):
    __tablename__ = "ai_results"

    id: Mapped[int] = mapped_column(primary_key=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"), unique=True, nullable=False)
    jd_analysis: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    match_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    match_breakdown: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    cover_letter: Mapped[str | None] = mapped_column(Text, nullable=True)
    skill_gaps: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    processing_status: Mapped[ProcessingStatus] = mapped_column(Enum(ProcessingStatus), default=ProcessingStatus.pending)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    application: Mapped["Application"] = relationship("Application", back_populates="ai_result")