from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.models.ingredient import Ingredient
from app.models.stock_movement import StockMovement
from app.schemas.ai import StockPrediction

LOOKBACK_DAYS = 30
LEAD_TIME_BUFFER_DAYS = 3  # assume it takes ~3 days for a new order to arrive

def predict_stock_needs(db: Session) -> list[StockPrediction]:
    ingredients = db.query(Ingredient).all()
    since = datetime.utcnow() - timedelta(days=LOOKBACK_DAYS)
    predictions = []

    for ingredient in ingredients:
        total_out = db.query(func.sum(StockMovement.quantity)).filter(
            StockMovement.ingredient_id == ingredient.id,
            StockMovement.movement_type == "out",
            StockMovement.created_at >= since,
        ).scalar() or 0.0

        avg_daily = total_out / LOOKBACK_DAYS if total_out else 0.0

        days_remaining = (ingredient.current_stock / avg_daily) if avg_daily > 0 else None

        suggested_reorder_qty = max(
            (avg_daily * LEAD_TIME_BUFFER_DAYS) - ingredient.current_stock, 0
        ) if avg_daily > 0 else 0.0

        is_low_stock = ingredient.current_stock <= ingredient.reorder_threshold

        predictions.append(StockPrediction(
            ingredient_id=ingredient.id,
            ingredient_name=ingredient.name,
            current_stock=ingredient.current_stock,
            unit=ingredient.unit,
            avg_daily_consumption=round(avg_daily, 3),
            days_remaining=round(days_remaining, 1) if days_remaining is not None else None,
            suggested_reorder_qty=round(suggested_reorder_qty, 2),
            is_low_stock=is_low_stock,
        ))

    return predictions
