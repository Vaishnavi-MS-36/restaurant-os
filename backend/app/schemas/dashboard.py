from pydantic import BaseModel
from typing import List

class SalesOverview(BaseModel):
    total_revenue: float
    total_orders: int

class ActiveOrdersCount(BaseModel):
    active_orders: int

class TableOccupancy(BaseModel):
    total_tables: int
    occupied: int
    available: int

class LowStockItem(BaseModel):
    id: int
    name: str
    current_stock: float
    reorder_threshold: float
    unit: str

class MonthlyExpenses(BaseModel):
    total_this_month: float

class PurchaseSummary(BaseModel):
    total_purchase_orders: int
    pending: int
    received: int

class SupplierSummary(BaseModel):
    total_suppliers: int
