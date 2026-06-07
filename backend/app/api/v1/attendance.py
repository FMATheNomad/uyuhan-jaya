from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.attendance import Attendance
from app.models.project import Project
from app.schemas import AttendanceCreate, AttendanceResponse
from app.services.whatsapp import wa_send_message

router = APIRouter(prefix="/api/v1/attendance", tags=["attendance"])


async def _notify_owner(db: AsyncSession, project_id: str, message: str):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        return
    owner_result = await db.execute(select(User).where(User.id == project.owner_id))
    owner = owner_result.scalar_one_or_none()
    if owner and owner.whatsapp_phone:
        await wa_send_message(owner.whatsapp_phone, message)


@router.post("/check-in", response_model=AttendanceResponse)
async def check_in(
    data: AttendanceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    import uuid
    from datetime import datetime, timezone

    attendance = Attendance(
        id=str(uuid.uuid4()),
        project_id=data.project_id,
        worker_name=data.worker_name,
        worker_phone=data.worker_phone,
        check_in_time=datetime.now(timezone.utc),
        latitude=data.latitude,
        longitude=data.longitude,
        photo_url=data.photo_url,
    )
    db.add(attendance)
    await db.flush()

    await _notify_owner(
        db, data.project_id,
        f"✅ Absensi\n{data.worker_name} check-in di proyek",
    )

    return AttendanceResponse.model_validate(attendance)


@router.post("/check-out/{attendance_id}", response_model=AttendanceResponse)
async def check_out(
    attendance_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime, timezone

    result = await db.execute(select(Attendance).where(Attendance.id == attendance_id))
    attendance = result.scalar_one_or_none()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    attendance.check_out_time = datetime.now(timezone.utc)
    await db.flush()
    return AttendanceResponse.model_validate(attendance)


@router.get("/project/{project_id}", response_model=List[AttendanceResponse])
async def list_attendance(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Attendance)
        .where(Attendance.project_id == project_id)
        .order_by(Attendance.created_at.desc())
    )
    records = result.scalars().all()
    return [AttendanceResponse.model_validate(r) for r in records]
