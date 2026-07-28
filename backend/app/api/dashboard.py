from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List
from datetime import datetime

from app.db.session import get_db
from app.models.order import Order, OrderItem
from app.models.table import RestaurantTable
from app.models.ingredient import Ingredient
from app.models.expense import Expense
from app.models.purchase_order import PurchaseOrder
from app.models.supplier import Supplier
from app.schemas.dashboard import (
    SalesOverview, ActiveOrdersCount, TableOccupancy,
    LowStockItem, MonthlyExpenses, PurchaseSummary, SupplierSummary, ProfitOverview, SalesTrend
)
from app.core.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/sales-overview", response_model=SalesOverview)
def sales_overview(db: Session = Depends(get_db), user=Depends(get_current_user)):
    completed_orders = db.query(Order).filter(Order.status == "completed").all()
    total_revenue = 0.0
    for order in completed_orders:
        for item in order.items:
            total_revenue += item.price_at_order * item.quantity
    return SalesOverview(total_revenue=total_revenue, total_orders=len(completed_orders))

@router.get("/active-orders", response_model=ActiveOrdersCount)
def active_orders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    count = db.query(Order).filter(Order.status == "active").count()
    return ActiveOrdersCount(active_orders=count)

@router.get("/table-occupancy", response_model=TableOccupancy)
def table_occupancy(db: Session = Depends(get_db), user=Depends(get_current_user)):
    total = db.query(RestaurantTable).count()
    occupied = db.query(RestaurantTable).filter(RestaurantTable.status == "occupied").count()
    return TableOccupancy(total_tables=total, occupied=occupied, available=total - occupied)

@router.get("/low-stock", response_model=List[LowStockItem])
def low_stock_items(db: Session = Depends(get_db), user=Depends(get_current_user)):
    items = db.query(Ingredient).filter(Ingredient.current_stock <= Ingredient.reorder_threshold).all()
    return items

@router.get("/monthly-expenses", response_model=MonthlyExpenses)
def monthly_expenses(db: Session = Depends(get_db), user=Depends(get_current_user)):
    now = datetime.utcnow()
    total = db.query(func.sum(Expense.amount)).filter(
        extract('month', Expense.created_at) == now.month,
        extract('year', Expense.created_at) == now.year
    ).scalar()
    return MonthlyExpenses(total_this_month=total or 0.0)

@router.get("/purchase-summary", response_model=PurchaseSummary)
def purchase_summary(db: Session = Depends(get_db), user=Depends(get_current_user)):
    total = db.query(PurchaseOrder).count()
    pending = db.query(PurchaseOrder).filter(PurchaseOrder.status == "pending").count()
    received = db.query(PurchaseOrder).filter(PurchaseOrder.status == "received").count()
    return PurchaseSummary(total_purchase_orders=total, pending=pending, received=received)

@router.get("/supplier-summary", response_model=SupplierSummary)
def supplier_summary(db: Session = Depends(get_db), user=Depends(get_current_user)):
    total = db.query(Supplier).count()
    return SupplierSummary(total_suppliers=total)

@router.get("/profit-overview", response_model=ProfitOverview)
def profit_overview(db: Session = Depends(get_db), user=Depends(get_current_user)):
    completed_orders = db.query(Order).filter(Order.status == "completed").all()
    total_revenue = 0.0
    for order in completed_orders:
        for item in order.items:
            total_revenue += item.price_at_order * item.quantity

    total_expenses = db.query(func.sum(Expense.amount)).scalar() or 0.0

    return ProfitOverview(
        total_revenue=total_revenue,
        total_expenses=total_expenses,
        profit=total_revenue - total_expenses,
    )

@router.get("/sales-trend", response_model=SalesTrend)
def sales_trend(db: Session = Depends(get_db), user=Depends(get_current_user)):
    from datetime import timedelta
    from app.schemas.dashboard import DailySales

    today = datetime.utcnow().date()
    daily_totals = {}
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        daily_totals[day.isoformat()] = 0.0

    orders = db.query(Order).filter(Order.status == "completed").all()
    for order in orders:
        order_day = order.created_at.date().isoformat()
        if order_day in daily_totals:
            for item in order.items:
                daily_totals[order_day] += item.price_at_order * item.quantity

    data = [DailySales(date=d, revenue=round(v, 2)) for d, v in daily_totals.items()]
    return SalesTrend(data=data)
