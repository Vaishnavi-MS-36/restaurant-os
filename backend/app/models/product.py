from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class ProductCategory(Base):
    __tablename__ = "product_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)


class Product(Base):
    """Retail/resale items sold as-is (bottled drinks, packaged snacks) —
    distinct from Menu items (cooked dishes) and Ingredients (recipe inputs)."""
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sku = Column(String, unique=True, nullable=True)
    category_id = Column(Integer, ForeignKey("product_categories.id"), nullable=True)
    price = Column(Float, nullable=False)
    stock_quantity = Column(Float, default=0)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)

    category = relationship("ProductCategory")
    warehouse = relationship("Warehouse")
