from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ExpenseCategoryCreate(BaseModel):
    name: str

class ExpenseCategoryOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class ExpenseCreate(BaseModel):
    category_id: Optional[int] = None
    supplier_name: Optional[str] = None
    description: Optional[str] = None
    amount: float
    expense_date: Optional[str] = None
    source_invoice_id: Optional[int] = None

class ExpenseOut(BaseModel):
    id: int
    category_id: Optional[int]
    supplier_name: Optional[str]
    description: Optional[str]
    amount: float
    expense_date: Optional[str]
    source_invoice_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True
