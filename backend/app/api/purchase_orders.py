from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.purchase_order import PurchaseOrder, PurchaseOrderItem
from app.models.ingredient import Ingredient
from app.models.stock_movement import StockMovement
from app.schemas.supplier import PurchaseOrderCreate, PurchaseOrderOut
from app.core.deps import get_current_user, require_role

router = APIRouter(prefix="/purchase-orders", tags=["purchase orders"])

@router.post("/", response_model=PurchaseOrderOut)
def create_purchase_order(payload: PurchaseOrderCreate, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager"))):
    po = PurchaseOrder(supplier_id=payload.supplier_id, status="pending")
    db.add(po)
    db.flush()

    for item in payload.items:
        ingredient = db.query(Ingredient).filter(Ingredient.id == item.ingredient_id).first()
        if not ingredient:
            raise HTTPException(status_code=404, detail=f"Ingredient {item.ingredient_id} not found")
        po_item = PurchaseOrderItem(
            purchase_order_id=po.id,
            ingredient_id=item.ingredient_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
        )
        db.add(po_item)

    db.commit()
    db.refresh(po)
    return po

@router.get("/", response_model=List[PurchaseOrderOut])
def list_purchase_orders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(PurchaseOrder).all()

@router.put("/{po_id}/receive", response_model=PurchaseOrderOut)
def receive_purchase_order(po_id: int, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager"))):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    if po.status == "received":
        raise HTTPException(status_code=400, detail="Purchase order already received")

    for item in po.items:
        ingredient = db.query(Ingredient).filter(Ingredient.id == item.ingredient_id).first()
        ingredient.current_stock += item.quantity

        movement = StockMovement(
            ingredient_id=item.ingredient_id,
            movement_type="in",
            quantity=item.quantity,
            reason=f"purchase order #{po.id}",
        )
        db.add(movement)

    po.status = "received"
    db.commit()
    db.refresh(po)
    return po
