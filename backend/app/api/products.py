from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.product import Product, ProductCategory
from app.schemas.product import ProductCreate, ProductOut, ProductCategoryCreate, ProductCategoryOut
from app.core.deps import get_current_user, require_role

router = APIRouter(prefix="/products", tags=["products"])

@router.post("/categories", response_model=ProductCategoryOut)
def create_category(payload: ProductCategoryCreate, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager", "store_manager"))):
    category = ProductCategory(name=payload.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.get("/categories", response_model=List[ProductCategoryOut])
def list_categories(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(ProductCategory).all()

@router.post("/", response_model=ProductOut)
def create_product(payload: ProductCreate, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager", "store_manager"))):
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.get("/", response_model=List[ProductOut])
def list_products(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Product).all()

@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductCreate, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager", "store_manager"))):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in payload.model_dump().items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager"))):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"detail": "Product deleted"}
