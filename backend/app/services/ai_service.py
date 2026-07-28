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

def suggest_menu_pricing(db: Session, markup_multiplier: float = 3.0):
    from app.models.menu_item import MenuItem
    from app.models.recipe import Recipe
    from app.models.purchase_order import PurchaseOrderItem
    from app.schemas.ai import MenuPricingSuggestion

    menu_items = db.query(MenuItem).all()
    suggestions = []

    for item in menu_items:
        recipes = db.query(Recipe).filter(Recipe.menu_item_id == item.id).all()
        total_cost = 0.0
        for recipe in recipes:
            latest_purchase = db.query(PurchaseOrderItem).filter(
                PurchaseOrderItem.ingredient_id == recipe.ingredient_id
            ).order_by(PurchaseOrderItem.id.desc()).first()

            unit_price = latest_purchase.unit_price if latest_purchase else 0.0
            total_cost += unit_price * recipe.quantity_required

        suggested_price = round(total_cost * markup_multiplier, 2)

        suggestions.append(MenuPricingSuggestion(
            menu_item_id=item.id,
            menu_item_name=item.name,
            current_price=item.price,
            estimated_ingredient_cost=round(total_cost, 2),
            suggested_price=suggested_price,
            margin_multiplier=markup_multiplier,
        ))

    return suggestions

def estimate_prep_time(db: Session):
    from app.models.menu_item import MenuItem
    from app.models.recipe import Recipe
    from app.schemas.ai import PrepTimeEstimate

    BASE_MINUTES = 5
    MINUTES_PER_INGREDIENT = 2.5

    menu_items = db.query(MenuItem).all()
    estimates = []

    for item in menu_items:
        ingredient_count = db.query(Recipe).filter(Recipe.menu_item_id == item.id).count()
        estimated = BASE_MINUTES + (ingredient_count * MINUTES_PER_INGREDIENT)
        estimates.append(PrepTimeEstimate(
            menu_item_id=item.id,
            menu_item_name=item.name,
            estimated_prep_minutes=round(estimated, 1),
        ))

    return estimates

def analyze_waste_risk(db: Session):
    from app.models.ingredient import Ingredient
    from app.schemas.ai import WasteRiskItem

    predictions = predict_stock_needs(db)
    risk_items = []

    for p in predictions:
        ingredient = db.query(Ingredient).filter(Ingredient.id == p.ingredient_id).first()

        if p.avg_daily_consumption == 0 and ingredient.current_stock > 0:
            risk_items.append(WasteRiskItem(
                ingredient_id=p.ingredient_id,
                ingredient_name=p.ingredient_name,
                current_stock=ingredient.current_stock,
                unit=ingredient.unit,
                avg_daily_consumption=0.0,
                risk_level="high",
                note="No recent consumption recorded — stock may be sitting unused and at risk of spoilage.",
            ))
        elif p.days_remaining and p.days_remaining > 60:
            risk_items.append(WasteRiskItem(
                ingredient_id=p.ingredient_id,
                ingredient_name=p.ingredient_name,
                current_stock=ingredient.current_stock,
                unit=ingredient.unit,
                avg_daily_consumption=p.avg_daily_consumption,
                risk_level="medium",
                note=f"At current usage rate, this stock will last {p.days_remaining} days — consider reducing future orders.",
            ))

    return risk_items
