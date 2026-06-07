from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.progress import ProgressPhoto
from app.schemas import ProgressPhotoCreate, ProgressPhotoResponse
from app.services.whatsapp import wa_send_message

router = APIRouter(prefix="/api/v1/progress", tags=["progress"])


async def _notify_owner(db: AsyncSession, project_id: str, message: str):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        return
    owner_result = await db.execute(select(User).where(User.id == project.owner_id))
    owner = owner_result.scalar_one_or_none()
    if owner and owner.whatsapp_phone:
        await wa_send_message(owner.whatsapp_phone, message)


@router.post("", response_model=ProgressPhotoResponse)
async def add_progress_photo(
    data: ProgressPhotoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    import uuid
    from datetime import datetime, timezone

    photo = ProgressPhoto(
        id=str(uuid.uuid4()),
        project_id=data.project_id,
        photo_url=data.photo_url,
        caption=data.caption,
        progress_percent=data.progress_percent,
        latitude=data.latitude,
        longitude=data.longitude,
        created_at=datetime.now(timezone.utc),
    )
    db.add(photo)
    await db.flush()

    pct = data.progress_percent or 0
    await _notify_owner(
        db, data.project_id,
        f"📸 Update Progres: {pct}%\n{data.caption or '-'}",
    )

    return ProgressPhotoResponse.model_validate(photo)


@router.get("/project/{project_id}", response_model=List[ProgressPhotoResponse])
async def list_progress(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ProgressPhoto)
        .where(ProgressPhoto.project_id == project_id)
        .order_by(ProgressPhoto.created_at.desc())
    )
    photos = result.scalars().all()
    return [ProgressPhotoResponse.model_validate(p) for p in photos]
