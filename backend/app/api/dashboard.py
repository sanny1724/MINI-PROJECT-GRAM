from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.village import Village
from app.models.geo import Mandal, District
from app.models.domains import WaterRecord, EducationRecord, HealthRecord, CropRecord, Grievance
from app.schemas.domains import VillageRiskSummary
from app.services.ai import risk_engine

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _latest(model, village_id: int, db: Session):
    return db.query(model).filter(model.village_id == village_id).order_by(model.recorded_at.desc()).first()


def _compute_village_risk(village: Village, db: Session) -> VillageRiskSummary:
    water = _latest(WaterRecord, village.id, db)
    education = _latest(EducationRecord, village.id, db)
    health = _latest(HealthRecord, village.id, db)
    crop = _latest(CropRecord, village.id, db)

    grievances = db.query(Grievance).filter(Grievance.village_id == village.id).all()
    total = len(grievances)
    open_count = sum(1 for g in grievances if g.status in ("open", "in_progress"))
    escalated_count = sum(1 for g in grievances if g.escalated_to_collector == 1)

    domain_risks = [
        risk_engine.water_risk(water),
        risk_engine.education_risk(education),
        risk_engine.health_risk(health),
        risk_engine.crop_risk(crop),
        risk_engine.governance_risk(open_count, escalated_count, total),
    ]
    overall_score, overall_level = risk_engine.overall_risk(domain_risks)

    return VillageRiskSummary(
        village_id=village.id,
        village_name=village.name,
        overall_risk_score=overall_score,
        overall_risk_level=overall_level,
        domains=domain_risks,
    )


@router.get("/villages/{village_id}/risk", response_model=VillageRiskSummary)
def village_risk(village_id: int, db: Session = Depends(get_db)):
    village = db.query(Village).filter(Village.id == village_id).first()
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")
    return _compute_village_risk(village, db)


@router.get("/mandals/{mandal_id}/risk", response_model=list[VillageRiskSummary])
def mandal_risk(mandal_id: int, db: Session = Depends(get_db)):
    """All villages in a mandal — this is the Tahsildar's monitoring view."""
    mandal = db.query(Mandal).filter(Mandal.id == mandal_id).first()
    if not mandal:
        raise HTTPException(status_code=404, detail="Mandal not found")
    villages = db.query(Village).filter(Village.mandal_id == mandal_id).all()
    return [_compute_village_risk(v, db) for v in villages]


@router.get("/districts/{district_id}/risk", response_model=list[VillageRiskSummary])
def district_risk(district_id: int, db: Session = Depends(get_db)):
    """All villages across every mandal in a district — the Collector's monitoring view."""
    district = db.query(District).filter(District.id == district_id).first()
    if not district:
        raise HTTPException(status_code=404, detail="District not found")
    villages = (
        db.query(Village)
        .join(Mandal, Village.mandal_id == Mandal.id)
        .filter(Mandal.district_id == district_id)
        .all()
    )
    return [_compute_village_risk(v, db) for v in villages]
