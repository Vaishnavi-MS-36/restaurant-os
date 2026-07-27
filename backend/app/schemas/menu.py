from pydantic import BaseModel
from typing import Optional

class CategoryCreate(BaseModel):
    name: str

class CategoryOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class MenuItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category_id: Optional[int] = None
    is_available: bool = True

class MenuItemOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    category_id: Optional[int]
    is_available: bool

    class Config:
        from_attributes = True
