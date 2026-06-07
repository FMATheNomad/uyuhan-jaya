import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.v1 import auth, projects, attendance, materials, progress, ai, upload, reports, qr_code, whatsapp
from app.core.config import settings
from app.core.database import engine, async_session_factory, Base
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.project import Project
from app.models.attendance import Attendance
from app.models.material import MaterialLog
from app.models.progress import ProgressPhoto

app = FastAPI(
    title="Uyuhan Jaya API",
    description="Construction project management for Indonesian contractors",
    version="0.1.0",
    docs_url="/docs" if os.getenv("ENV") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENV") != "production" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.effective_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(attendance.router)
app.include_router(materials.router)
app.include_router(progress.router)
app.include_router(ai.router)
app.include_router(upload.router)
app.include_router(reports.router)
app.include_router(qr_code.router)
app.include_router(whatsapp.router)

STATIC_DIR = Path(__file__).parent.parent / "frontend" / "dist"
BASE_DIR = Path(__file__).parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
if UPLOAD_DIR.exists():
    app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")


@app.exception_handler(401)
async def unauthorized_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=401, content={"detail": "Unauthorized"})


@app.exception_handler(403)
async def forbidden_handler(request: Request, exc: Exception):
    detail = getattr(exc, "detail", "Forbidden")
    return JSONResponse(status_code=403, content={"detail": detail})


@app.exception_handler(404)
async def not_found_handler(request: Request, exc: Exception):
    if STATIC_DIR.exists() and not request.url.path.startswith("/api/"):
        path = str(STATIC_DIR / request.url.path.lstrip("/"))
        if (STATIC_DIR / "index.html").exists():
            return FileResponse(str(STATIC_DIR / "index.html"))
    detail = getattr(exc, "detail", "Not found")
    return JSONResponse(status_code=404, content={"detail": detail})


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.on_event("startup")
async def startup():
    settings.check_secret()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as db:
        from sqlalchemy import select
        result = await db.execute(select(User).where(User.email == "admin@uyuhan.com"))
        if not result.scalar_one_or_none():
            import uuid
            from datetime import datetime, timezone, timedelta

            admin_id = str(uuid.uuid4())
            admin = User(
                id=admin_id,
                name="Uyuhan Jaya Corp",
                email="admin@uyuhan.com",
                hashed_password=hash_password("uyuhan123"),
                role=UserRole.owner,
                is_active=True,
                created_at=datetime.now(timezone.utc),
            )
            db.add(admin)

            demo_id = str(uuid.uuid4())
            demo = User(
                id=demo_id,
                name="Asep Kontraktor",
                email="demo@uyuhan.com",
                hashed_password=hash_password("demo123"),
                role=UserRole.contractor,
                is_active=True,
                created_at=datetime.now(timezone.utc),
            )
            db.add(demo)

            mandor_id = str(uuid.uuid4())
            mandor = User(
                id=mandor_id,
                name="Mang Udin",
                email="mandor@uyuhan.com",
                hashed_password=hash_password("mandor123"),
                phone="6285179626821",
                role=UserRole.mandor,
                is_active=True,
                created_at=datetime.now(timezone.utc),
            )
            db.add(mandor)

            admin.whatsapp_phone = "6282120097282"
            admin.whatsapp_connected = True
            await db.flush()

            proj_id = str(uuid.uuid4())
            project = Project(
                id=proj_id,
                owner_id=admin_id,
                name="Rumah Pak RT — Cimahi",
                description="Renovasi rumah tinggal 2 lantai, luas 150m2",
                location="Jl. Cimahi Indah No. 14, Cimahi",
                start_date=datetime.now(timezone.utc).date() - timedelta(days=14),
                end_date=datetime.now(timezone.utc).date() + timedelta(days=60),
                budget=350_000_000,
                status="active",
                created_at=datetime.now(timezone.utc),
            )
            db.add(project)

            tukang = ["Asep", "Ujang", "Cecep", "Deden", "Entis"]
            for i, name in enumerate(tukang):
                checkin = datetime.now(timezone.utc) - timedelta(days=i % 3, hours=2)
                db.add(Attendance(
                    id=str(uuid.uuid4()), project_id=proj_id, worker_name=name,
                    check_in_time=checkin,
                    check_out_time=checkin + timedelta(hours=8),
                    status="present",
                ))

            for hari in range(5):
                for name in tukang[:4]:
                    day = datetime.now(timezone.utc) - timedelta(days=hari)
                    db.add(Attendance(
                        id=str(uuid.uuid4()), project_id=proj_id, worker_name=name,
                        check_in_time=day.replace(hour=7, minute=30),
                        check_out_time=day.replace(hour=16, minute=0),
                        status="present",
                    ))

            materials = [
                ("Semen", "Material Pokok", 100, "sak", 65_000),
                ("Pasir", "Material Pokok", 10, "kubik", 250_000),
                ("Bata Ringan", "Material Pokok", 800, "buah", 1_200),
                ("Besi Beton 10mm", "Besi", 50, "batang", 85_000),
                ("Cat Tembok", "Finishing", 10, "galon", 185_000),
                ("Keramik 60x60", "Finishing", 80, "dus", 75_000),
            ]
            for name, cat, qty, unit, price in materials:
                db.add(MaterialLog(
                    id=str(uuid.uuid4()), project_id=proj_id, name=name,
                    category=cat, quantity=qty, unit=unit,
                    price_per_unit=price, total_price=qty * price,
                    used_at=datetime.now(timezone.utc) - timedelta(days=5),
                    created_at=datetime.now(timezone.utc),
                ))

            for i, (cap, pct) in enumerate([
                ("Pondasi selesai digali", 10),
                ("Pengecoran pondasi", 25),
                ("Dinding lantai 1 mulai", 40),
            ]):
                db.add(ProgressPhoto(
                    id=str(uuid.uuid4()), project_id=proj_id,
                    photo_url="/uploads/general/demo_placeholder.jpg",
                    caption=cap, progress_percent=pct,
                    created_at=datetime.now(timezone.utc) - timedelta(days=(3-i)*4),
                ))

            await db.commit()
            print("✅ Demo data seeded: admin, projects, attendances, materials, progress")


@app.get("/favicon.svg")
async def favicon():
    return FileResponse(str(STATIC_DIR / "favicon.svg")) if STATIC_DIR.exists() else JSONResponse(status_code=404, content={"detail": "Not found"})


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0", "project": "Uyuhan Jaya"}
