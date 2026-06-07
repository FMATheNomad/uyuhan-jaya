from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.project import Project
from app.models.attendance import Attendance
from app.models.material import MaterialLog
from app.models.progress import ProgressPhoto

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])


@router.get("/project/{project_id}")
async def project_report(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.owner:
        result = await db.execute(select(Project).where(Project.id == project_id))
    else:
        result = await db.execute(
            select(Project).where(Project.id == project_id, Project.owner_id == current_user.id)
        )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    today = date.today()
    week_ago = today - timedelta(days=7)
    budget = float(project.budget) if project.budget else 0

    total_workers = await db.execute(
        select(func.count(func.distinct(Attendance.worker_name)))
        .where(Attendance.project_id == project_id)
    )
    total_workers = total_workers.scalar() or 0

    today_attendance = await db.execute(
        select(func.count()).where(
            Attendance.project_id == project_id,
            func.date(Attendance.check_in_time) == today,
        )
    )
    today_attendance = today_attendance.scalar() or 0

    weekly_attendance_raw = await db.execute(
        select(
            func.date(Attendance.check_in_time).label("day"),
            func.count().label("total"),
        )
        .where(
            Attendance.project_id == project_id,
            func.date(Attendance.check_in_time) >= week_ago,
        )
        .group_by(func.date(Attendance.check_in_time))
        .order_by(func.date(Attendance.check_in_time))
    )
    weekly_attendance = [{"date": str(row.day), "total": row.total} for row in weekly_attendance_raw]

    total_material_cost = await db.execute(
        select(func.coalesce(func.sum(MaterialLog.total_price), 0))
        .where(MaterialLog.project_id == project_id)
    )
    total_material_cost = float(total_material_cost.scalar() or 0)

    material_by_category = await db.execute(
        select(
            MaterialLog.category,
            func.coalesce(func.sum(MaterialLog.total_price), 0).label("total"),
        )
        .where(MaterialLog.project_id == project_id)
        .group_by(MaterialLog.category)
    )
    materials_by_cat = [
        {"category": row.category or "Lainnya", "total": float(row.total)}
        for row in material_by_category
    ]

    latest_progress = await db.execute(
        select(ProgressPhoto)
        .where(ProgressPhoto.project_id == project_id)
        .order_by(ProgressPhoto.created_at.desc())
        .limit(1)
    )
    latest_progress = latest_progress.scalar_one_or_none()
    progress_percent = latest_progress.progress_percent if latest_progress else 0
    total_photos = await db.execute(
        select(func.count()).where(ProgressPhoto.project_id == project_id)
    )
    total_photos = total_photos.scalar() or 0

    budget_used_pct = (total_material_cost / budget * 100) if budget > 0 else 0

    return {
        "project_name": project.name,
        "status": project.status,
        "total_workers": total_workers,
        "today_attendance": today_attendance,
        "weekly_attendance": weekly_attendance,
        "total_material_cost": total_material_cost,
        "materials_by_category": materials_by_cat,
        "total_photos": total_photos,
        "progress_percent": progress_percent,
        "budget": budget,
        "budget_used": total_material_cost,
        "budget_remaining": budget - total_material_cost,
        "budget_used_pct": round(budget_used_pct, 1),
    }
