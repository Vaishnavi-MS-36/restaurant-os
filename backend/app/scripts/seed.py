"""
Seed the database with one demo login per role and a handful of sample
records so the dashboard and modules aren't empty on first run.

Run with:
    cd backend
    python -m app.scripts.seed
"""

from app.db.session import SessionLocal, engine, Base
from app.models.user import User
from app.models.table import RestaurantTable
from app.models.category import Category
from app.models.menu_item import MenuItem
from app.models.ingredient import Ingredient
from app.core.security import hash_password

# Password is the same for every seeded account: Passw0rd!
DEMO_PASSWORD = "Passw0rd!"

DEMO_USERS = [
    {"name": "Olivia Owner", "email": "owner@restaurantos.dev", "role": "owner"},
    {"name": "Manu Manager", "email": "manager@restaurantos.dev", "role": "manager"},
    {"name": "Chris Chef", "email": "chef@restaurantos.dev", "role": "chef"},
    {"name": "Wendy Waiter", "email": "waiter@restaurantos.dev", "role": "waiter"},
    {"name": "Cara Cashier", "email": "cashier@restaurantos.dev", "role": "cashier"},
    {"name": "Sam Storekeeper", "email": "store@restaurantos.dev", "role": "store_manager"},
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Users
        for u in DEMO_USERS:
            if not db.query(User).filter(User.email == u["email"]).first():
                db.add(User(
                    name=u["name"],
                    email=u["email"],
                    password_hash=hash_password(DEMO_PASSWORD),
                    role=u["role"],
                ))

        # Tables
        if db.query(RestaurantTable).count() == 0:
            for i in range(1, 9):
                db.add(RestaurantTable(number=i, capacity=2 if i % 2 == 0 else 4))

        # Category + menu items
        if db.query(Category).count() == 0:
            starters = Category(name="Starters")
            mains = Category(name="Mains")
            db.add_all([starters, mains])
            db.flush()
            db.add_all([
                MenuItem(name="Garlic Bread", price=4.5, category_id=starters.id),
                MenuItem(name="Paneer Tikka", price=7.0, category_id=starters.id),
                MenuItem(name="Margherita Pizza", price=9.5, category_id=mains.id),
                MenuItem(name="Chicken Biryani", price=11.0, category_id=mains.id),
            ])

        # Ingredients
        if db.query(Ingredient).count() == 0:
            db.add_all([
                Ingredient(name="Flour", unit="kg", current_stock=20, reorder_threshold=5),
                Ingredient(name="Paneer", unit="kg", current_stock=3, reorder_threshold=5),
                Ingredient(name="Chicken", unit="kg", current_stock=8, reorder_threshold=4),
                Ingredient(name="Tomato", unit="kg", current_stock=2, reorder_threshold=6),
            ])

        db.commit()
        print("Seed complete. Demo login password for all accounts:", DEMO_PASSWORD)
        for u in DEMO_USERS:
            print(f"  {u['role']:<14} {u['email']}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
