from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from decimal import Decimal

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.material import MaterialLog
from app.schemas import MaterialCreate, MaterialResponse

router = APIRouter(prefix="/api/v1/materials", tags=["materials"])


@router.post("", response_model=MaterialResponse)
async def create_material(
    data: MaterialCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    import uuid
    from datetime import datetime, timezone

    total = data.price_per_unit * Decimal(str(data.quantity)) if data.price_per_unit else Decimal(0)

    material = MaterialLog(
        id=str(uuid.uuid4()),
        project_id=data.project_id,
        name=data.name,
        category=data.category,
        quantity=data.quantity,
        unit=data.unit,
        price_per_unit=data.price_per_unit or Decimal(0),
        total_price=total,
        notes=data.notes,
        used_at=datetime.now(timezone.utc),
        created_at=datetime.now(timezone.utc),
    )
    db.add(material)
    await db.flush()
    return MaterialResponse.model_validate(material)


@router.get("/project/{project_id}", response_model=List[MaterialResponse])
async def list_materials(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(MaterialLog)
        .where(MaterialLog.project_id == project_id)
        .order_by(MaterialLog.used_at.desc())
    )
    materials = result.scalars().all()
    return [MaterialResponse.model_validate(m) for m in materials]
