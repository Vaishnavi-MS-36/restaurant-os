from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.services.ai_service import predict_stock_needs
from app.schemas.ai import StockPrediction
from app.core.deps import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])

@router.get("/stock-predictions", response_model=List[StockPrediction])
def stock_predictions(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return predict_stock_needs(db)
