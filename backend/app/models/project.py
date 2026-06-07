import uuid
from datetime import datetime, timezone, date
from decimal import Decimal
from sqlalchemy import String, Text, DateTime, Date, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    owner_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    location: Mapped[str] = mapped_column(String(255), nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=True)
    end_date: Mapped[date] = mapped_column(Date, nullable=True)
    budget: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    status: Mapped[str] = mapped_column(
        String(20), default="planning"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    owner = relationship("User", back_populates="projects")
    attendances = relationship("Attendance", back_populates="project", cascade="all, delete-orphan")
    material_logs = relationship("MaterialLog", back_populates="project", cascade="all, delete-orphan")
    progress_photos = relationship("ProgressPhoto", back_populates="project", cascade="all, delete-orphan")
