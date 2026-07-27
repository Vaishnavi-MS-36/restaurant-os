from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.order import Order, OrderItem
from app.models.menu_item import MenuItem
from app.models.recipe import Recipe
from app.models.ingredient import Ingredient
from app.models.stock_movement import StockMovement
from app.schemas.order import OrderCreate, OrderOut
from app.core.deps import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=OrderOut)
def create_order(payload: OrderCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = Order(table_id=payload.table_id, status="active")
    db.add(order)
    db.flush()

    for item in payload.items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item.menu_item_id).first()
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item {item.menu_item_id} not found")

        recipes = db.query(Recipe).filter(Recipe.menu_item_id == item.menu_item_id).all()
        for recipe in recipes:
            ingredient = db.query(Ingredient).filter(Ingredient.id == recipe.ingredient_id).first()
            required_qty = recipe.quantity_required * item.quantity
            if ingredient.current_stock < required_qty:
                raise HTTPException(
                    status_code=400,
                    detail=f"Not enough stock for {ingredient.name}: have {ingredient.current_stock}{ingredient.unit}, need {required_qty}{ingredient.unit}"
                )
            ingredient.current_stock -= required_qty

            movement = StockMovement(
                ingredient_id=ingredient.id,
                movement_type="out",
                quantity=required_qty,
                reason=f"order #{order.id}",
            )
            db.add(movement)

        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=item.menu_item_id,
            quantity=item.quantity,
            price_at_order=menu_item.price,
        )
        db.add(order_item)

    db.commit()
    db.refresh(order)
    return order

@router.get("/", response_model=List[OrderOut])
def list_orders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Order).all()

@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/{order_id}/complete", response_model=OrderOut)
def complete_order(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = "completed"
    db.commit()
    db.refresh(order)
    return order
