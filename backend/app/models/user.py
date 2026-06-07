import uuid
from datetime import datetime, date, timezone
from sqlalchemy import String, Boolean, DateTime, Date, Integer, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum


AI_DAILY_LIMIT = 5


class UserRole(str, enum.Enum):
    owner = "owner"
    contractor = "contractor"
    mandor = "mandor"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="user_role"), default=UserRole.contractor
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    whatsapp_connected: Mapped[bool] = mapped_column(Boolean, default=False)
    whatsapp_phone: Mapped[str] = mapped_column(String(20), nullable=True)

    ai_daily_count: Mapped[int] = mapped_column(Integer, default=0)
    ai_daily_date: Mapped[date] = mapped_column(Date, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    projects = relationship("Project", back_populates="owner")
