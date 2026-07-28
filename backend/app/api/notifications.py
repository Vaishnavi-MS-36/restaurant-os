from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.notification import Notification
from app.models.ingredient import Ingredient
from app.models.purchase_order import PurchaseOrder
from app.schemas.notification import NotificationOut
from app.core.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=List[NotificationOut])
def list_notifications(db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Sync fresh alerts based on current state (avoids duplicate spam by checking existing unread ones)
    low_stock_items = db.query(Ingredient).filter(Ingredient.current_stock <= Ingredient.reorder_threshold).all()
    for item in low_stock_items:
        existing = db.query(Notification).filter(
            Notification.type == "low_stock",
            Notification.message.like(f"%{item.name}%"),
            Notification.is_read == False,
        ).first()
        if not existing:
            db.add(Notification(
                message=f"Low stock alert: {item.name} is at {item.current_stock}{item.unit}",
                type="low_stock",
            ))

    pending_pos = db.query(PurchaseOrder).filter(PurchaseOrder.status == "pending").all()
    for po in pending_pos:
        existing = db.query(Notification).filter(
            Notification.type == "pending_po",
            Notification.message.like(f"%PO #{po.id}%"),
            Notification.is_read == False,
        ).first()
        if not existing:
            db.add(Notification(
                message=f"Purchase order PO #{po.id} is still pending",
                type="pending_po",
            ))

    db.commit()

    return db.query(Notification).order_by(Notification.created_at.desc()).limit(50).all()

@router.put("/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"detail": "Marked as read"}
