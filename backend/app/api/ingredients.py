from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.ingredient import Ingredient
from app.schemas.ingredient import IngredientCreate, IngredientOut
from app.core.deps import get_current_user, require_role

router = APIRouter(prefix="/ingredients", tags=["ingredients"])

@router.post("/", response_model=IngredientOut)
def create_ingredient(payload: IngredientCreate, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager"))):
    existing = db.query(Ingredient).filter(Ingredient.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ingredient already exists")
    ingredient = Ingredient(**payload.model_dump())
    db.add(ingredient)
    db.commit()
    db.refresh(ingredient)
    return ingredient

@router.get("/", response_model=List[IngredientOut])
def list_ingredients(search: str = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    query = db.query(Ingredient)
    if search:
        query = query.filter(Ingredient.name.ilike(f'%{search}%'))
    return query.all()

@router.get("/{ingredient_id}", response_model=IngredientOut)
def get_ingredient(ingredient_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return ingredient

@router.put("/{ingredient_id}", response_model=IngredientOut)
def update_ingredient(ingredient_id: int, payload: IngredientCreate, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager"))):
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    for key, value in payload.model_dump().items():
        setattr(ingredient, key, value)
    db.commit()
    db.refresh(ingredient)
    return ingredient

@router.delete("/{ingredient_id}")
def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager"))):
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    db.delete(ingredient)
    db.commit()
    return {"detail": "Ingredient deleted"}
