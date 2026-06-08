from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.project import Project
from app.models.attendance import Attendance
from app.models.material import MaterialLog
from app.models.progress import ProgressPhoto
from app.schemas import UserResponse
from app.services.whatsapp import wa_get_status, wa_send_message

router = APIRouter(prefix="/api/v1/whatsapp", tags=["whatsapp"])


def _format_phone(phone: str) -> str:
    phone = phone.strip().replace(" ", "").replace("-", "").replace("+", "").replace("@s.whatsapp.net", "")
    if phone.startswith("0"):
        phone = "62" + phone[1:]
    return phone


def _parse_command(text: str) -> tuple[str, str]:
    text = text.strip().lower()
    for cmd in ["absen", "pulang", "progres", "progress", "material", "bahan", "status", "bantuan", "help"]:
        if text.startswith(cmd):
            args = text[len(cmd):].strip()
            return cmd, args
    return "", text


async def _get_user_by_phone(phone: str, db: AsyncSession) -> Optional[User]:
    phone = _format_phone(phone)
    result = await db.execute(select(User).where(User.whatsapp_phone == phone))
    return result.scalar_one_or_none()


async def _get_user_project(user: User, db: AsyncSession) -> Optional[Project]:
    if user.role in (UserRole.owner, UserRole.mandor):
        result = await db.execute(select(Project).order_by(Project.created_at.desc()))
    else:
        result = await db.execute(
            select(Project).where(Project.owner_id == user.id).order_by(Project.created_at.desc())
        )
    return result.scalars().first()


async def _send_reply(to: str, message: str):
    await wa_send_message(to, message)


@router.get("/status")
async def wa_status():
    status = await wa_get_status()
    return status


@router.get("/qr")
async def wa_qr():
    qr_data = await wa_get_qr()
    return qr_data


@router.post("/set-phone")
async def wa_set_phone(
    phone: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number required")
    phone = _format_phone(phone)
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.whatsapp_phone = phone
    user.whatsapp_connected = True
    await db.flush()
    return {"success": True, "phone": phone}


@router.post("/test")
async def wa_test(
    to: str = Body(default="", embed=True),
    current_user: User = Depends(get_current_user),
):
    phone = _format_phone(to) if to else (current_user.whatsapp_phone or "")
    if not phone:
        raise HTTPException(status_code=400, detail="No WhatsApp number set")
    ok = await wa_send_message(phone, "🔧 *MiniCrane*\n\nNotifikasi WhatsApp berfungsi! 🎉")
    if not ok:
        raise HTTPException(status_code=502, detail="WhatsApp service unavailable")
    return {"success": True, "sent_to": phone}


@router.get("/me", response_model=UserResponse)
async def wa_my_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return UserResponse.model_validate(current_user)


@router.post("/webhook")
async def whatsapp_webhook(data: dict, db: AsyncSession = Depends(get_db)):
    sender = data.get("sender", "")
    text = data.get("text", "")
    name = data.get("name", "Unknown")
    phone = sender.split("@")[0] if "@" in sender else sender

    print(f"[WA] From {name} ({phone}): {text}")

    cmd, args = _parse_command(text)
    reply = ""

    if not cmd:
        reply = (
            "👋 Halo! Perintah yang tersedia:\n\n"
            "• `absen [nama]` — absen masuk tukang\n"
            "• `pulang [nama]` — absen pulang\n"
            "• `progres [%] [keterangan]` — update progres\n"
            "• `material [nama] [jumlah]` — catat material\n"
            "• `status` — info proyek\n"
            "• `bantuan` — pesan ini"
        )
        await _send_reply(phone, reply)
        return {"status": "ok", "reply": "help_sent"}

    user = await _get_user_by_phone(phone, db)
    if not user:
        await _send_reply(phone, "Maaf, nomor ini belum terdaftar di MiniCrane. Hubungi admin.")
        return {"status": "ok", "reply": "user_not_found"}

    import uuid
    from datetime import datetime, timezone

    if cmd == "bantuan" or cmd == "help":
        reply = (
            "📖 *Bantuan Perintah*\n\n"
            "`absen Asep` — check-in Asep\n"
            "`pulang Asep` — check-out Asep\n"
            "`progres 50 cor pondasi` — update progres\n"
            "`material semen 50` — catat 50 sak semen\n"
            "`status` — ringkasan proyek"
        )

    elif cmd == "status":
        project = await _get_user_project(user, db)
        if not project:
            reply = "Belum ada proyek."
        else:
            from app.services.dashboard_service import get_project_dashboard
            d = await get_project_dashboard(db, project.id)
            reply = (
                f"📊 *{d['project_name']}*\n"
                f"Progres: {d['progress_percent']}%\n"
                f"Tukang: {d['total_workers']} orang\n"
                f"Hadir hari ini: {d['today_attendance']}\n"
                f"Budget: Rp {d['budget']:,.0f}\n"
                f"Terpakai: Rp {d['total_material_cost']:,.0f}"
            )

    elif cmd == "absen":
        if not args:
            reply = "Gunakan: `absen [nama tukang]`"
        else:
            project = await _get_user_project(user, db)
            if not project:
                reply = "Tidak ada proyek aktif."
            else:
                db.add(Attendance(
                    id=str(uuid.uuid4()), project_id=project.id,
                    worker_name=args.title(),
                    check_in_time=datetime.now(timezone.utc),
                    status="present",
                ))
                await db.flush()
                reply = f"✅ {args.title()} check-in di *{project.name}*"

    elif cmd == "pulang":
        if not args:
            reply = "Gunakan: `pulang [nama tukang]`"
        else:
            result = await db.execute(
                select(Attendance)
                .where(Attendance.worker_name == args.title())
                .order_by(Attendance.check_in_time.desc())
                .limit(1)
            )
            att = result.scalar_one_or_none()
            if att and not att.check_out_time:
                att.check_out_time = datetime.now(timezone.utc)
                await db.flush()
                reply = f"✅ {args.title()} check-out"
            else:
                reply = f"{args.title()} belum check-in atau sudah check-out"

    elif cmd in ("progres", "progress"):
        if not args:
            reply = "Gunakan: `progres [%] [keterangan]`"
        else:
            project = await _get_user_project(user, db)
            if not project:
                reply = "Tidak ada proyek aktif."
            else:
                parts = args.split(" ", 1)
                try:
                    pct = float(parts[0].replace("%", ""))
                    caption = parts[1] if len(parts) > 1 else ""
                except ValueError:
                    pct = 0
                    caption = args
                db.add(ProgressPhoto(
                    id=str(uuid.uuid4()), project_id=project.id,
                    photo_url="",
                    caption=caption, progress_percent=pct,
                    created_at=datetime.now(timezone.utc),
                ))
                await db.flush()
                reply = f"📸 Progres: {pct}% — {caption or '-'}"

    elif cmd in ("material", "bahan"):
        if not args:
            reply = "Gunakan: `material [nama] [jumlah]`"
        else:
            project = await _get_user_project(user, db)
            if not project:
                reply = "Tidak ada proyek aktif."
            else:
                parts = args.rsplit(" ", 1)
                name = parts[0].title()
                try:
                    qty = float(parts[1])
                except (ValueError, IndexError):
                    qty = 1
                db.add(MaterialLog(
                    id=str(uuid.uuid4()), project_id=project.id,
                    name=name, quantity=qty, unit="pcs",
                    total_price=0,
                    used_at=datetime.now(timezone.utc),
                    created_at=datetime.now(timezone.utc),
                ))
                await db.flush()
                reply = f"📦 {name}: {qty} pcs dicatat"

    if reply:
        await _send_reply(phone, reply)

    return {"status": "ok", "reply": "processed"}
