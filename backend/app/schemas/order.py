from pydantic import BaseModel
from typing import List
from datetime import datetime

class TableCreate(BaseModel):
    number: int
    capacity: int
    status: str = "available"

class TableOut(BaseModel):
    id: int
    number: int
    capacity: int
    status: str

    class Config:
        from_attributes = True

class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int

class OrderCreate(BaseModel):
    table_id: int
    items: List[OrderItemCreate]

class OrderItemOut(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    price_at_order: float

    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    table_id: int
    status: str
    created_at: datetime
    items: List[OrderItemOut]

    class Config:
        from_attributes = True
