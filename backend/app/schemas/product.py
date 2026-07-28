from pydantic import BaseModel
from typing import Optional

class ProductCategoryCreate(BaseModel):
    name: str

class ProductCategoryOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    category_id: Optional[int] = None
    price: float
    stock_quantity: float = 0
    warehouse_id: Optional[int] = None

class ProductOut(BaseModel):
    id: int
    name: str
    sku: Optional[str]
    category_id: Optional[int]
    price: float
    stock_quantity: float
    warehouse_id: Optional[int]

    class Config:
        from_attributes = True
