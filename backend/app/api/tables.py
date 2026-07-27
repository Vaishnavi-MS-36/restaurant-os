from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.table import RestaurantTable
from app.schemas.order import TableCreate, TableOut
from app.core.deps import get_current_user, require_role

router = APIRouter(prefix="/tables", tags=["tables"])

@router.post("/", response_model=TableOut)
def create_table(payload: TableCreate, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager"))):
    existing = db.query(RestaurantTable).filter(RestaurantTable.number == payload.number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Table number already exists")
    table = RestaurantTable(**payload.model_dump())
    db.add(table)
    db.commit()
    db.refresh(table)
    return table

@router.get("/", response_model=List[TableOut])
def list_tables(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(RestaurantTable).all()

@router.put("/{table_id}", response_model=TableOut)
def update_table(table_id: int, payload: TableCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    table = db.query(RestaurantTable).filter(RestaurantTable.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    for key, value in payload.model_dump().items():
        setattr(table, key, value)
    db.commit()
    db.refresh(table)
    return table
