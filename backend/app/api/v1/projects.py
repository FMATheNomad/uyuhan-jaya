from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.project import Project
from app.schemas import ProjectCreate, ProjectResponse

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


@router.post("", response_model=ProjectResponse)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.owner, UserRole.contractor])),
):
    import uuid
    from datetime import datetime, timezone

    project = Project(
        id=str(uuid.uuid4()),
        owner_id=current_user.id,
        name=data.name,
        description=data.description,
        location=data.location,
        start_date=data.start_date,
        end_date=data.end_date,
        budget=data.budget,
        created_at=datetime.now(timezone.utc),
    )
    db.add(project)
    await db.flush()
    return ProjectResponse.model_validate(project)


@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role in (UserRole.owner, UserRole.mandor):
        result = await db.execute(select(Project).order_by(Project.created_at.desc()))
    else:
        result = await db.execute(
            select(Project).where(Project.owner_id == current_user.id).order_by(Project.created_at.desc())
        )
    projects = result.scalars().all()
    return [ProjectResponse.model_validate(p) for p in projects]


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role in (UserRole.owner, UserRole.mandor):
        result = await db.execute(select(Project).where(Project.id == project_id))
    else:
        result = await db.execute(
            select(Project).where(Project.id == project_id, Project.owner_id == current_user.id)
        )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse.model_validate(project)
