from pydantic import BaseModel

class IngredientCreate(BaseModel):
    name: str
    unit: str
    current_stock: float = 0
    reorder_threshold: float = 0

class IngredientOut(BaseModel):
    id: int
    name: str
    unit: str
    current_stock: float
    reorder_threshold: float

    class Config:
        from_attributes = True
