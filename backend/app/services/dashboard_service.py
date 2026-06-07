from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.project import Project
from app.models.attendance import Attendance
from app.models.material import MaterialLog
from app.models.progress import ProgressPhoto
from datetime import date, timedelta
from decimal import Decimal


async def get_project_dashboard(db: AsyncSession, project_id: str) -> dict:
    project = await db.execute(select(Project).where(Project.id == project_id))
    project = project.scalar_one_or_none()
    if not project:
        return {}

    today = date.today()

    total_workers = await db.execute(
        select(func.count(func.distinct(Attendance.worker_name)))
        .where(Attendance.project_id == project_id)
    )
    total_workers = total_workers.scalar() or 0

    today_attendance = await db.execute(
        select(func.count())
        .where(
            Attendance.project_id == project_id,
            func.date(Attendance.check_in_time) == today,
        )
    )
    today_attendance = today_attendance.scalar() or 0

    total_material_cost = await db.execute(
        select(func.coalesce(func.sum(MaterialLog.total_price), 0))
        .where(MaterialLog.project_id == project_id)
    )
    total_material_cost = float(total_material_cost.scalar() or 0)

    total_photos = await db.execute(
        select(func.count())
        .where(ProgressPhoto.project_id == project_id)
    )
    total_photos = total_photos.scalar() or 0

    latest_progress = await db.execute(
        select(ProgressPhoto)
        .where(ProgressPhoto.project_id == project_id)
        .order_by(ProgressPhoto.created_at.desc())
        .limit(1)
    )
    latest_progress = latest_progress.scalar_one_or_none()
    progress_percent = latest_progress.progress_percent if latest_progress else 0

    budget = float(project.budget) if project.budget else 0
    budget_used_pct = (total_material_cost / budget * 100) if budget > 0 else 0

    return {
        "project_name": project.name,
        "status": project.status,
        "total_workers": total_workers,
        "today_attendance": today_attendance,
        "total_material_cost": total_material_cost,
        "total_photos": total_photos,
        "progress_percent": progress_percent,
        "budget": budget,
        "budget_used": total_material_cost,
        "budget_used_pct": round(budget_used_pct, 1),
    }
