from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.expense import Expense, ExpenseCategory
from app.schemas.expense import ExpenseCreate, ExpenseOut, ExpenseCategoryCreate, ExpenseCategoryOut
from app.core.deps import get_current_user, require_role

router = APIRouter(prefix="/expenses", tags=["expenses"])

@router.post("/categories", response_model=ExpenseCategoryOut)
def create_expense_category(payload: ExpenseCategoryCreate, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager"))):
    category = ExpenseCategory(name=payload.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.get("/categories", response_model=List[ExpenseCategoryOut])
def list_expense_categories(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(ExpenseCategory).all()

@router.post("/", response_model=ExpenseOut)
def create_expense(payload: ExpenseCreate, db: Session = Depends(get_db), user=Depends(require_role("owner", "manager"))):
    expense = Expense(**payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.get("/", response_model=List[ExpenseOut])
def list_expenses(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Expense).order_by(Expense.created_at.desc()).all()
