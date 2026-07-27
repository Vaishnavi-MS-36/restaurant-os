from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from app.db.session import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    extracted_data = Column(JSON, nullable=True)
    status = Column(String, default="processing")  # processing | extracted | confirmed | failed
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
