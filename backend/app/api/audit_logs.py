from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogOut
from app.core.deps import require_role

router = APIRouter(prefix="/audit-logs", tags=["audit logs"])

@router.get("/", response_model=List[AuditLogOut])
def list_audit_logs(db: Session = Depends(get_db), user=Depends(require_role("owner", "manager"))):
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(200).all()
