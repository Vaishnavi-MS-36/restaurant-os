from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SupplierCreate(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class SupplierOut(BaseModel):
    id: int
    name: str
    contact_person: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    address: Optional[str]

    class Config:
        from_attributes = True

class PurchaseOrderItemCreate(BaseModel):
    ingredient_id: int
    quantity: float
    unit_price: float

class PurchaseOrderCreate(BaseModel):
    supplier_id: int
    items: List[PurchaseOrderItemCreate]

class PurchaseOrderItemOut(BaseModel):
    id: int
    ingredient_id: int
    quantity: float
    unit_price: float

    class Config:
        from_attributes = True

class PurchaseOrderOut(BaseModel):
    id: int
    supplier_id: int
    status: str
    created_at: datetime
    items: List[PurchaseOrderItemOut]

    class Config:
        from_attributes = True
