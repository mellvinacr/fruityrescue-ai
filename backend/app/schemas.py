from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


# ── Auth ──
class AuthRegister(BaseModel):
    name: str
    email: str
    password: str

class AuthLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    model_config = ConfigDict(from_attributes=True)

class AuthResponse(BaseModel):
    access_token: str
    user: UserOut


# ── Recipients ──
class RecipientBase(BaseModel):
    name: str
    type: str
    address: str
    contact: Optional[str] = None
    capacity_kg: float = 100

class RecipientCreate(RecipientBase):
    pass

class RecipientUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    address: Optional[str] = None
    contact: Optional[str] = None
    capacity_kg: Optional[float] = None

class RecipientResponse(RecipientBase):
    id: int
    active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── Allocations ──
class AllocationResponse(BaseModel):
    id: int
    fruit_id: int
    recipient_id: Optional[int] = None
    allocation_type: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
    recipient: Optional[RecipientResponse] = None
    model_config = ConfigDict(from_attributes=True)

class AllocationCreate(BaseModel):
    fruit_id: int
    allocation_type: str


# ── Fruits ──
class FruitResponse(BaseModel):
    id: int
    donor_id: Optional[int] = None
    donor_name: Optional[str] = None
    contact: Optional[str] = None
    location: Optional[str] = None
    photo_url: Optional[str] = None
    quantity_kg: Optional[float] = None
    notes: Optional[str] = None
    fruit_name: Optional[str] = None
    status: str
    ai_confidence: Optional[float] = None
    freshness_score: Optional[int] = None
    estimated_days: Optional[int] = None
    visual_condition: Optional[str] = None
    quick_recommendation: Optional[str] = None
    storage_tips: Optional[str] = None
    ai_recommendation: Optional[str] = None
    ai_reason: Optional[str] = None
    created_at: datetime
    allocations: List[AllocationResponse] = []
    model_config = ConfigDict(from_attributes=True)


# ── Chat ──
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: str
