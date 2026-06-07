import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import String, Text, DateTime, Numeric, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class MaterialLog(Base):
    __tablename__ = "material_logs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    project_id: Mapped[str] = mapped_column(
        ForeignKey("projects.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=True)
    quantity: Mapped[float] = mapped_column(Float, default=0)
    unit: Mapped[str] = mapped_column(String(20), default="pcs")
    price_per_unit: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    total_price: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    used_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    project = relationship("Project", back_populates="material_logs")
