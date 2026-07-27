from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.recipe import Recipe
from app.models.menu_item import MenuItem
from app.models.ingredient import Ingredient
from app.schemas.recipe import RecipeCreate, RecipeOut
from app.core.deps import get_current_user, require_role

router = APIRouter(prefix="/recipes", tags=["recipes"])

@router.post("/", response_model=RecipeOut)
def create_recipe(payload: RecipeCreate, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager"))):
    menu_item = db.query(MenuItem).filter(MenuItem.id == payload.menu_item_id).first()
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    ingredient = db.query(Ingredient).filter(Ingredient.id == payload.ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")

    recipe = Recipe(**payload.model_dump())
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe

@router.get("/", response_model=List[RecipeOut])
def list_recipes(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Recipe).all()

@router.get("/menu-item/{menu_item_id}", response_model=List[RecipeOut])
def get_recipe_for_menu_item(menu_item_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Recipe).filter(Recipe.menu_item_id == menu_item_id).all()

@router.delete("/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager"))):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    db.delete(recipe)
    db.commit()
    return {"detail": "Recipe entry deleted"}
