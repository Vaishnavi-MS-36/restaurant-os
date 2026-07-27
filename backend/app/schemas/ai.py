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
