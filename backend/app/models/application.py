import enum
from datetime import datetime, date
from typing import TYPE_CHECKING

from sqlalchemy import String, Text, ForeignKey, DateTime, Date, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.ai_result import AIResult
    from app.models.resume import Resume
    from app.models.user import User

class ApplicationStatus(str, enum.Enum):
    saved = "saved"
    applied = "applied"
    interview = "interview"
    offer = "offer"
    rejected = "rejected"

class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    resume_id: Mapped[int | None] = mapped_column(ForeignKey("resumes.id"), nullable=True)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    job_title: Mapped[str] = mapped_column(String(255), nullable=False)
    job_description: Mapped[str] = mapped_column(Text, nullable=False)
    job_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[ApplicationStatus] = mapped_column(Enum(ApplicationStatus), default=ApplicationStatus.saved)
    applied_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship("User", back_populates="applications")
    resume: Mapped["Resume | None"] = relationship("Resume", back_populates="applications")
    ai_result: Mapped["AIResult | None"] = relationship("AIResult", back_populates="application", uselist=False, cascade="all, delete")