from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.services.ai_service import (
    predict_stock_needs, suggest_menu_pricing, estimate_prep_time, analyze_waste_risk
)
from app.schemas.ai import StockPrediction, MenuPricingSuggestion, PrepTimeEstimate, WasteRiskItem
from app.core.deps import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])

@router.get("/stock-predictions", response_model=List[StockPrediction])
def stock_predictions(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return predict_stock_needs(db)

@router.get("/menu-pricing", response_model=List[MenuPricingSuggestion])
def menu_pricing(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return suggest_menu_pricing(db)

@router.get("/prep-time", response_model=List[PrepTimeEstimate])
def prep_time(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return estimate_prep_time(db)

@router.get("/waste-analysis", response_model=List[WasteRiskItem])
def waste_analysis(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return analyze_waste_risk(db)
