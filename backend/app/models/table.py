from sqlalchemy import Column, Integer, String
from app.db.session import Base

class RestaurantTable(Base):
    __tablename__ = "tables"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(Integer, unique=True, nullable=False)
    capacity = Column(Integer, nullable=False)
    status = Column(String, default="available")  # available, occupied, reserved
