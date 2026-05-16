import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Boolean, Enum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.application import Application
    from app.models.resume import Resume

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.user)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    resumes: Mapped[list["Resume"]] = relationship("Resume", back_populates="user", cascade="all, delete")
    applications: Mapped[list["Application"]] = relationship("Application", back_populates="user", cascade="all, delete")





#     User Model Explanation
# This is a SQLAlchemy ORM model that defines the structure of a users table in your database. It uses modern SQLAlchemy 2.0 syntax with type hints via the Mapped generic type.

# Core Attributes
# The model stores essential user information:

# id: A primary key that uniquely identifies each user in the database
# email and username: Both are unique and indexed for fast lookups, ensuring no duplicate accounts exist. The index on email optimizes authentication queries
# hashed_password: Stores the hashed version of the user's password (never store plain text passwords)
# role: Uses an Enum type to assign user roles (like admin, moderator, user), defaulting to regular user status
# is_active and is_email_verified: Boolean flags that track account status—users start as unverified and active by default
# created_at and updated_at: Timestamp columns that automatically record when records are created and modified using database functions
# Relationships
# The model defines two one-to-many relationships:

# resumes: Links each user to their resume documents. The back_populates="user" creates a bidirectional relationship, and cascade="all, delete" ensures that deleting a user automatically deletes their associated resumes
# applications: Similarly links users to job applications they've submitted, with the same cascading delete behavior
# This design keeps your data consistent—you won't orphan resumes or applications when removing a user account.