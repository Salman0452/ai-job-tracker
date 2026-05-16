from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User

class AdminLog(Base):
    __tablename__ = "admin_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    admin_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    target_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    admin: Mapped["User"] = relationship("User", foreign_keys=[admin_id])
    target_user: Mapped["User | None"] = relationship("User", foreign_keys=[target_user_id])