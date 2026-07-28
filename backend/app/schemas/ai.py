from pydantic import BaseModel
from typing import Optional

class StockPrediction(BaseModel):
    ingredient_id: int
    ingredient_name: str
    current_stock: float
    unit: str
    avg_daily_consumption: float
    days_remaining: Optional[float]
    suggested_reorder_qty: float
    is_low_stock: bool

class MenuPricingSuggestion(BaseModel):
    menu_item_id: int
    menu_item_name: str
    current_price: float
    estimated_ingredient_cost: float
    suggested_price: float
    margin_multiplier: float

class PrepTimeEstimate(BaseModel):
    menu_item_id: int
    menu_item_name: str
    estimated_prep_minutes: float

class WasteRiskItem(BaseModel):
    ingredient_id: int
    ingredient_name: str
    current_stock: float
    unit: str
    avg_daily_consumption: float
    risk_level: str
    note: str
