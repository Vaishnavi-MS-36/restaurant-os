from pydantic import BaseModel

class RecipeCreate(BaseModel):
    menu_item_id: int
    ingredient_id: int
    quantity_required: float

class RecipeOut(BaseModel):
    id: int
    menu_item_id: int
    ingredient_id: int
    quantity_required: float

    class Config:
        from_attributes = True
