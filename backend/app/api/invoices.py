from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from openpyxl import Workbook
from io import BytesIO
import os
import traceback

from app.db.session import get_db
from app.models.invoice import Invoice
from app.services.ocr_service import extract_invoice_data
from app.schemas.invoice import InvoiceUploadResponse
from app.core.deps import get_current_user, require_role

router = APIRouter(prefix="/invoices", tags=["invoices"])
UPLOAD_DIR = "uploads/invoices"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=InvoiceUploadResponse)
async def upload_invoice(file: UploadFile = File(...), db: Session = Depends(get_db), user=Depends(require_role("owner", "manager"))):
    file_bytes = await file.read()
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    try:
        extracted = extract_invoice_data(file_bytes, file.filename)
        status = "extracted"
    except Exception as e:
        print("OCR ERROR:", str(e))
        traceback.print_exc()
        extracted = None
        status = "failed"

    invoice = Invoice(
        file_name=file.filename,
        file_path=file_path,
        extracted_data=extracted.model_dump() if extracted else None,
        status=status,
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    if status == "failed":
        raise HTTPException(status_code=422, detail="OCR extraction failed")

    return InvoiceUploadResponse(
        id=invoice.id,
        file_name=invoice.file_name,
        status=invoice.status,
        extracted_data=extracted,
    )

@router.get("/")
def list_invoices(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Invoice).order_by(Invoice.uploaded_at.desc()).all()

@router.get("/export/expense-register")
def export_expense_register(db: Session = Depends(get_db), user=Depends(get_current_user)):
    invoices = db.query(Invoice).filter(Invoice.status == "extracted").all()

    wb = Workbook()
    ws = wb.active
    ws.title = "Expense Register"
    ws.append(["Invoice No", "Supplier", "Date", "Description", "Qty", "Unit Price", "Amount"])

    for inv in invoices:
        data = inv.extracted_data or {}
        for item in data.get("line_items", []):
            ws.append([
                data.get("invoice_number"),
                data.get("supplier_name"),
                data.get("invoice_date"),
                item.get("description"),
                item.get("quantity"),
                item.get("unit_price"),
                item.get("amount"),
            ])

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=expense_register.xlsx"},
    )
