import os
import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import JSONResponse

from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/upload", tags=["upload"])

UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE = 10 * 1024 * 1024


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Hanya JPEG, PNG, WebP, GIF yang diizinkan")
    
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File terlalu besar. Maksimal 10MB")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    
    date_dir = "general"
    filepath = UPLOAD_DIR / date_dir
    filepath.mkdir(parents=True, exist_ok=True)
    
    with open(filepath / filename, "wb") as f:
        f.write(contents)

    url = f"/uploads/{date_dir}/{filename}"
    return {"url": url, "filename": filename}
