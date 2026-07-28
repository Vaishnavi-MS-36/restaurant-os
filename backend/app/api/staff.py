from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.user import User
from app.schemas.staff import StaffCreate, StaffUpdate, StaffOut
from app.core.security import hash_password
from app.core.deps import get_current_user, require_role

router = APIRouter(prefix="/staff", tags=["staff"])

VALID_ROLES = ["owner", "manager", "chef", "waiter", "cashier", "store_manager"]

@router.post("/", response_model=StaffOut)
def create_staff(payload: StaffCreate, db: Session = Depends(get_db), user=Depends(require_role("owner"))):
    if payload.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of {VALID_ROLES}")
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    staff = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        phone=payload.phone,
    )
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return staff

@router.get("/", response_model=List[StaffOut])
def list_staff(db: Session = Depends(get_db), user=Depends(require_role("owner", "manager"))):
    return db.query(User).all()

@router.put("/{staff_id}", response_model=StaffOut)
def update_staff(staff_id: int, payload: StaffUpdate, db: Session = Depends(get_db), user=Depends(require_role("owner"))):
    staff = db.query(User).filter(User.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "role" in update_data and update_data["role"] not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of {VALID_ROLES}")

    for key, value in update_data.items():
        setattr(staff, key, value)
    db.commit()
    db.refresh(staff)
    return staff

@router.delete("/{staff_id}")
def deactivate_staff(staff_id: int, db: Session = Depends(get_db), user=Depends(require_role("owner"))):
    staff = db.query(User).filter(User.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    staff.is_active = False
    db.commit()
    return {"detail": "Staff member deactivated"}
