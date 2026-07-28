from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, menu, ingredients, recipes, tables, orders, suppliers, purchase_orders, invoices, expenses, dashboard, ai
from app.core.config import settings

app = FastAPI(title="RestaurantOS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(menu.router)
app.include_router(ingredients.router)
app.include_router(recipes.router)
app.include_router(tables.router)
app.include_router(orders.router)
app.include_router(suppliers.router)
app.include_router(purchase_orders.router)
app.include_router(invoices.router)
app.include_router(expenses.router)
app.include_router(dashboard.router)
app.include_router(ai.router)

@app.get("/")
def root():
    return {"status": "RestaurantOS API is running"}
