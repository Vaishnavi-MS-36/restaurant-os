from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.warehouse import Warehouse
from app.schemas.warehouse import WarehouseCreate, WarehouseOut
from app.core.deps import get_current_user, require_role

router = APIRouter(prefix="/warehouses", tags=["warehouses"])

@router.post("/", response_model=WarehouseOut)
def create_warehouse(payload: WarehouseCreate, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager", "store_manager"))):
    existing = db.query(Warehouse).filter(Warehouse.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Warehouse already exists")
    warehouse = Warehouse(**payload.model_dump())
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)
    return warehouse

@router.get("/", response_model=List[WarehouseOut])
def list_warehouses(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Warehouse).all()

@router.delete("/{warehouse_id}")
def delete_warehouse(warehouse_id: int, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager"))):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    db.delete(warehouse)
    db.commit()
    return {"detail": "Warehouse deleted"}
