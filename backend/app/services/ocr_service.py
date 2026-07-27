import json
import mimetypes
from google import genai
from google.genai import types
from app.core.config import settings
from app.schemas.invoice import ExtractedInvoiceData

client = genai.Client(api_key=settings.GEMINI_API_KEY)

EXTRACTION_PROMPT = """You are an invoice data extraction system for a restaurant's expense management platform.

You will be shown an image of a supplier invoice. It may be:
- A cleanly printed, tabular invoice
- A handwritten invoice with messy handwriting

Extract the following fields and return ONLY valid JSON, no markdown fences, no preamble:

{
  "supplier_name": string or null,
  "invoice_number": string or null,
  "invoice_date": string or null (as written on the invoice, don't reformat),
  "line_items": [
    {"description": string, "quantity": number, "unit_price": number, "amount": number}
  ],
  "subtotal": number or null,
  "tax_amount": number or null,
  "total_amount": number or null,
  "confidence_note": string or null (flag any field you had to guess at, especially handwriting you're unsure about; null if everything was clear)
}

Rules:
- If a field is illegible or absent, use null rather than guessing a fake value.
- For handwritten invoices, do your best to read the handwriting, but flag uncertainty in confidence_note rather than silently inventing numbers.
- amount for each line item should equal quantity * unit_price where legible; if math doesn't reconcile, trust what's written and note it in confidence_note.
"""

def extract_invoice_data(file_bytes: bytes, file_name: str) -> ExtractedInvoiceData:
    mime_type, _ = mimetypes.guess_type(file_name)
    if mime_type is None:
        mime_type = "image/jpeg"

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=[
            types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
            EXTRACTION_PROMPT,
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )

    raw = response.text.strip()
    data = json.loads(raw)
    return ExtractedInvoiceData(**data)
