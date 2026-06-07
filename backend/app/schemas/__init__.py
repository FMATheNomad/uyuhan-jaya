from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    role: str = "contractor"


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    whatsapp_connected: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class LoginRequest(BaseModel):
    email: str
    password: str


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[Decimal] = Decimal(0)


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: float
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AttendanceCreate(BaseModel):
    project_id: str
    worker_name: str
    worker_phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photo_url: Optional[str] = None


class AttendanceResponse(BaseModel):
    id: str
    project_id: str
    worker_name: str
    worker_phone: Optional[str] = None
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MaterialCreate(BaseModel):
    project_id: str
    name: str
    category: Optional[str] = None
    quantity: float = 0
    unit: str = "pcs"
    price_per_unit: Optional[Decimal] = Decimal(0)
    notes: Optional[str] = None


class MaterialResponse(BaseModel):
    id: str
    project_id: str
    name: str
    category: Optional[str] = None
    quantity: float
    unit: str
    price_per_unit: float
    total_price: float
    notes: Optional[str] = None
    used_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class ProgressPhotoCreate(BaseModel):
    project_id: str
    photo_url: str
    caption: Optional[str] = None
    progress_percent: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ProgressPhotoResponse(BaseModel):
    id: str
    project_id: str
    photo_url: str
    caption: Optional[str] = None
    progress_percent: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AIGenerateRequest(BaseModel):
    prompt: str
    context: Optional[dict] = None
