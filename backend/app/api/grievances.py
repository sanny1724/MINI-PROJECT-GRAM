from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.village import Village
from app.models.domains import Grievance
from app.models.user import User, RoleEnum
from app.schemas.domains import GrievanceIn, GrievanceOut
from app.auth.deps import get_current_user, require_roles

router = APIRouter(prefix="/api/villages/{village_id}/grievances", tags=["grievances"])


@router.get("/", response_model=List[GrievanceOut])
def list_grievances(village_id: int, db: Session = Depends(get_db)):
    return db.query(Grievance).filter(Grievance.village_id == village_id).all()


@router.post("/", response_model=GrievanceOut)
def file_grievance(
    village_id: int,
    payload: GrievanceIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    village = db.query(Village).filter(Village.id == village_id).first()
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")

    grievance = Grievance(
        village_id=village_id,
        filed_by_user_id=current_user.id,
        category=payload.category,
        description=payload.description,
    )
    db.add(grievance)
    db.commit()
    db.refresh(grievance)
    return grievance


@router.patch(
    "/{grievance_id}/status",
    response_model=GrievanceOut,
    dependencies=[Depends(require_roles([RoleEnum.panchayat, RoleEnum.collector]))],
)
def update_grievance_status(
    village_id: int, grievance_id: int, status_value: str, escalate: bool = False,
    db: Session = Depends(get_db),
):
    grievance = db.query(Grievance).filter(
        Grievance.id == grievance_id, Grievance.village_id == village_id
    ).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    grievance.status = status_value
    grievance.escalated_to_collector = 1 if escalate else grievance.escalated_to_collector
    db.commit()
    db.refresh(grievance)
    return grievance
