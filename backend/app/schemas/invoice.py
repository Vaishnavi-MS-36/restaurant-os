from pydantic import BaseModel
from typing import Optional

class InvoiceLineItem(BaseModel):
    description: str
    quantity: float
    unit_price: float
    amount: float

class ExtractedInvoiceData(BaseModel):
    supplier_name: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    line_items: list[InvoiceLineItem] = []
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    total_amount: Optional[float] = None
    confidence_note: Optional[str] = None

class InvoiceUploadResponse(BaseModel):
    id: int
    file_name: str
    status: str
    extracted_data: ExtractedInvoiceData
