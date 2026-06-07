from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles, check_ai_limit
from app.models.user import User, UserRole
from app.schemas import AIGenerateRequest
from app.services.ai_service import generate_rab_ai, generate_rab_excel, analyze_progress_with_ai, predict_cashflow
from app.services.dashboard_service import get_project_dashboard

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


@router.post("/rab")
async def ai_generate_rab(
    data: AIGenerateRequest,
    current_user: User = Depends(check_ai_limit),
):
    result = await generate_rab_ai(data.prompt)
    return result


@router.post("/rab-excel")
async def ai_download_rab_excel_from_data(
    data: dict = Body(...),
    current_user: User = Depends(check_ai_limit),
):
    try:
        excel_bytes = await generate_rab_excel(data)
        name = data.get("project_name", "proyek")[:20]
        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="RAB-{name}.xlsx"'},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal generate Excel: {str(e)}")


@router.post("/analyze/{project_id}")
async def ai_analyze_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_ai_limit),
):
    dashboard = await get_project_dashboard(db, project_id)
    if not dashboard:
        raise HTTPException(status_code=404, detail="Project not found")
    result = await analyze_progress_with_ai(dashboard)
    return {"result": result}


@router.post("/cashflow/{project_id}")
async def ai_predict_cashflow(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_ai_limit),
):
    dashboard = await get_project_dashboard(db, project_id)
    if not dashboard:
        raise HTTPException(status_code=404, detail="Project not found")
    result = await predict_cashflow(dashboard)
    return {"result": result}


@router.get("/dashboard/{project_id}")
async def dashboard(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dashboard = await get_project_dashboard(db, project_id)
    if not dashboard:
        raise HTTPException(status_code=404, detail="Project not found")
    return dashboard
