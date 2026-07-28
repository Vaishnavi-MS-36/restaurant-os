from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.menu_item import MenuItem
from app.models.category import Category
from app.schemas.menu import MenuItemCreate, MenuItemOut, CategoryCreate, CategoryOut
from app.core.deps import get_current_user, require_role
from app.services.audit_service import log_action

router = APIRouter(prefix="/menu", tags=["menu"])

# ---- Categories ----

@router.post("/categories", response_model=CategoryOut)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager"))):
    existing = db.query(Category).filter(Category.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    category = Category(name=payload.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.get("/categories", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Category).all()

# ---- Menu Items ----

@router.post("/items", response_model=MenuItemOut)
def create_menu_item(payload: MenuItemCreate, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager"))):
    item = MenuItem(**payload.model_dump())
    db.add(item)
    db.flush()
    log_action(db, user.id, "create", "menu_item", item.id, f"Created menu item '{item.name}'")
    db.commit()
    db.refresh(item)
    return item

@router.get("/items", response_model=List[MenuItemOut])
def list_menu_items(search: str = None, category_id: int = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    query = db.query(MenuItem)
    if search:
        query = query.filter(MenuItem.name.ilike(f'%{search}%'))
    if category_id:
        query = query.filter(MenuItem.category_id == category_id)
    return query.all()

@router.get("/items/{item_id}", response_model=MenuItemOut)
def get_menu_item(item_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return item

@router.put("/items/{item_id}", response_model=MenuItemOut)
def update_menu_item(item_id: int, payload: MenuItemCreate, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager"))):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/items/{item_id}")
def delete_menu_item(item_id: int, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager"))):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    log_action(db, user.id, "delete", "menu_item", item.id, f"Deleted menu item '{item.name}'")
    db.delete(item)
    db.commit()
    return {"detail": "Menu item deleted"}
