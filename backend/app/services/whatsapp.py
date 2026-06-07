import httpx
from typing import Optional
from app.core.config import settings

WA_SERVICE_URL = "http://localhost:3001"


async def wa_get_status() -> dict:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{WA_SERVICE_URL}/status")
            return resp.json()
    except Exception as e:
        return {"status": "unavailable", "error": str(e)}


async def wa_get_qr() -> dict:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{WA_SERVICE_URL}/qr")
            return resp.json()
    except Exception as e:
        return {"status": "error", "error": str(e)}


async def wa_send_message(to: str, message: str) -> bool:
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{WA_SERVICE_URL}/send",
                json={"to": to, "message": message},
            )
            return resp.status_code == 200
    except Exception:
        return False


async def wa_send_image(to: str, image_url: str, caption: str = "") -> bool:
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{WA_SERVICE_URL}/send-image",
                json={"to": to, "image_url": image_url, "caption": caption},
            )
            return resp.status_code == 200
    except Exception:
        return False


async def notify_attendance(worker_name: str, project_name: str, phone: Optional[str] = None):
    if not phone:
        return False
    msg = f"✅ *Absensi*\n{worker_name} telah check-in di proyek *{project_name}*"
    return await wa_send_message(phone, msg)


async def notify_progress(
    project_name: str,
    progress_pct: float,
    caption: str,
    phone: Optional[str] = None,
):
    if not phone:
        return False
    msg = (
        f"📸 *Update Progres*\n"
        f"Proyek: *{project_name}*\n"
        f"Progres: {progress_pct}%\n"
        f"Keterangan: {caption or '-'}"
    )
    return await wa_send_message(phone, msg)
