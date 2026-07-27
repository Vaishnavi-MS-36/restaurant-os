from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    movement_type = Column(String, nullable=False)  # "in" or "out"
    quantity = Column(Float, nullable=False)
    reason = Column(String, nullable=True)  # e.g. "purchase order #4", "order #12", "wastage"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ingredient = relationship("Ingredient")
