from pydantic import BaseModel
from typing import Optional

class WarehouseCreate(BaseModel):
    name: str
    location: Optional[str] = None

class WarehouseOut(BaseModel):
    id: int
    name: str
    location: Optional[str]

    class Config:
        from_attributes = True
