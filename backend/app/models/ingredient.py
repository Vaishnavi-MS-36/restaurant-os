from sqlalchemy import Column, Integer, String, Float
from app.db.session import Base

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    unit = Column(String, nullable=False)  # kg, litre, piece, etc.
    current_stock = Column(Float, default=0)
    reorder_threshold = Column(Float, default=0)  # used later for low-stock alerts
