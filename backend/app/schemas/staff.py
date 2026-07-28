from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class StaffCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    phone: Optional[str] = None

class StaffUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class StaffOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    phone: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
