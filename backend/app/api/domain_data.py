from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.village import Village
from app.models.domains import WaterRecord, EducationRecord, HealthRecord, CropRecord
from app.models.user import RoleEnum
from app.schemas.domains import WaterRecordIn, EducationRecordIn, HealthRecordIn, CropRecordIn
from app.auth.deps import require_roles

router = APIRouter(prefix="/api/villages/{village_id}", tags=["domain-data"])

WRITE_ROLES = [RoleEnum.panchayat, RoleEnum.collector]


def _get_village_or_404(village_id: int, db: Session) -> Village:
    village = db.query(Village).filter(Village.id == village_id).first()
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")
    return village


@router.post("/water", dependencies=[Depends(require_roles(WRITE_ROLES))])
def add_water_record(village_id: int, payload: WaterRecordIn, db: Session = Depends(get_db)):
    _get_village_or_404(village_id, db)
    record = WaterRecord(village_id=village_id, **payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/education", dependencies=[Depends(require_roles(WRITE_ROLES))])
def add_education_record(village_id: int, payload: EducationRecordIn, db: Session = Depends(get_db)):
    _get_village_or_404(village_id, db)
    record = EducationRecord(village_id=village_id, **payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/health", dependencies=[Depends(require_roles(WRITE_ROLES))])
def add_health_record(village_id: int, payload: HealthRecordIn, db: Session = Depends(get_db)):
    _get_village_or_404(village_id, db)
    record = HealthRecord(village_id=village_id, **payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/crop", dependencies=[Depends(require_roles(WRITE_ROLES))])
def add_crop_record(village_id: int, payload: CropRecordIn, db: Session = Depends(get_db)):
    _get_village_or_404(village_id, db)
    record = CropRecord(village_id=village_id, **payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
