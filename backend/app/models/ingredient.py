from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    unit = Column(String, nullable=False)
    current_stock = Column(Float, default=0)
    reorder_threshold = Column(Float, default=0)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)

    warehouse = relationship("Warehouse")
