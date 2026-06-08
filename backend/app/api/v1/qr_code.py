import io
from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
import qrcode

router = APIRouter(prefix="/api/v1/qr", tags=["qr"])


@router.get("/project/{project_id}")
async def project_qr(
    project_id: str,
    current_user: User = Depends(get_current_user),
):
    checkin_url = f"https://minicrane.app/absen/{project_id}"
    
    qr = qrcode.QRCode(box_size=10, border=4)
    qr.add_data(checkin_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return Response(content=buf.getvalue(), media_type="image/png")
