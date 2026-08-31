from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.village import Village
from app.models.geo import Mandal, District
from app.models.domains import WaterRecord, EducationRecord, HealthRecord, CropRecord, Grievance
from app.schemas.domains import VillageRiskSummary
from app.services.ai import risk_engine

from app.models.user import User, RoleEnum
from app.auth.deps import get_current_user

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


@router.get("/officer/village/{village_id}")
def get_officer_village_dashboard(village_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Authentication check
    if current_user.role == RoleEnum.citizen:
        raise HTTPException(status_code=403, detail="Citizens cannot access officer dashboard")

    village = db.query(Village).filter(Village.id == village_id).first()
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")

    # 2. Administrative Scope Authorization Check
    if current_user.role == RoleEnum.panchayat:
        if current_user.village_id != village_id:
            raise HTTPException(status_code=403, detail="Unauthorized: You do not manage this village")
            
    elif current_user.role == RoleEnum.tahsildar:
        if village.mandal_id != current_user.mandal_id:
            raise HTTPException(status_code=403, detail="Unauthorized: This village is outside your mandal")
            
    elif current_user.role == RoleEnum.collector:
        mandal = db.query(Mandal).filter(Mandal.id == village.mandal_id).first()
        if not mandal or mandal.district_id != current_user.district_id:
            raise HTTPException(status_code=403, detail="Unauthorized: This village is outside your district")

    # Fetch and aggregate dashboard metrics
    from app.api.villages import get_village_dashboard
    return get_village_dashboard(village_id, db)


@router.get("/officer/mandal/{mandal_id}")
def get_officer_mandal_dashboard(mandal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Authentication check
    if current_user.role not in (RoleEnum.tahsildar, RoleEnum.collector, RoleEnum.state):
        raise HTTPException(status_code=403, detail="Unauthorized role")

    mandal = db.query(Mandal).filter(Mandal.id == mandal_id).first()
    if not mandal:
        raise HTTPException(status_code=404, detail="Mandal not found")

    # 2. Scope check
    if current_user.role == RoleEnum.tahsildar and current_user.mandal_id != mandal_id:
        raise HTTPException(status_code=403, detail="Unauthorized: You do not monitor this mandal")
    elif current_user.role == RoleEnum.collector and mandal.district_id != current_user.district_id:
        raise HTTPException(status_code=403, detail="Unauthorized: This mandal is outside your district")

    villages = db.query(Village).filter(Village.mandal_id == mandal_id).all()
    
    village_summaries = []
    total_population = 0
    total_score = 0.0
    critical_count = 0

    for v in villages:
        risk = _compute_village_risk(v, db)
        score = risk.overall_risk_score
        level = risk.overall_risk_level
        total_score += score
        if level == "Critical" or level == "High":
            critical_count += 1
            
        pop = v.population or 0
        total_population += pop
        
        village_summaries.append({
            "id": v.id,
            "name": v.name,
            "lgd_code": v.lgd_code,
            "population": pop,
            "risk_score": score,
            "risk_level": level
        })

    avg_score = round(total_score / len(villages), 1) if villages else 0.0

    return {
        "mandalInfo": {
            "id": mandal.id,
            "name": mandal.name,
            "districtName": mandal.district.name if mandal.district else "Unknown",
        },
        "stats": {
            "totalVillages": len(villages),
            "totalPopulation": total_population,
            "averageRiskScore": avg_score,
            "criticalVillagesCount": critical_count
        },
        "villages": village_summaries
    }


@router.get("/officer/district/{district_id}")
def get_officer_district_dashboard(district_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Authentication check
    if current_user.role not in (RoleEnum.collector, RoleEnum.state):
        raise HTTPException(status_code=403, detail="Unauthorized role")

    district = db.query(District).filter(District.id == district_id).first()
    if not district:
        raise HTTPException(status_code=404, detail="District not found")

    # 2. Scope check
    if current_user.role == RoleEnum.collector and current_user.district_id != district_id:
        raise HTTPException(status_code=403, detail="Unauthorized: You do not monitor this district")

    mandals = db.query(Mandal).filter(Mandal.district_id == district_id).all()
    mandal_ids = [m.id for m in mandals]

    villages = db.query(Village).filter(Village.mandal_id.in_(mandal_ids)).all() if mandal_ids else []

    mandal_summaries = []
    for m in mandals:
        mv = [v for v in villages if v.mandal_id == m.id]
        mandal_summaries.append({
            "id": m.id,
            "name": m.name,
            "totalVillages": len(mv),
            "population": sum(v.population or 0 for v in mv)
        })

    village_summaries = []
    total_population = 0
    total_score = 0.0
    critical_count = 0

    for v in villages:
        risk = _compute_village_risk(v, db)
        score = risk.overall_risk_score
        level = risk.overall_risk_level
        total_score += score
        if level == "Critical" or level == "High":
            critical_count += 1
            
        pop = v.population or 0
        total_population += pop
        
        village_summaries.append({
            "id": v.id,
            "name": v.name,
            "mandal_name": v.mandal.name if v.mandal else "Unknown",
            "population": pop,
            "risk_score": score,
            "risk_level": level
        })

    avg_score = round(total_score / len(villages), 1) if villages else 0.0

    return {
        "districtInfo": {
            "id": district.id,
            "name": district.name,
        },
        "stats": {
            "totalMandals": len(mandals),
            "totalVillages": len(villages),
            "totalPopulation": total_population,
            "averageRiskScore": avg_score,
            "criticalVillagesCount": critical_count
        },
        "mandals": mandal_summaries,
        "villages": village_summaries
    }


@router.get("/officer/state")
def get_officer_state_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Authentication check
    if current_user.role != RoleEnum.state:
        raise HTTPException(status_code=403, detail="Unauthorized role")

    districts = db.query(District).all()
    mandals_count = db.query(Mandal).count()
    villages_count = db.query(Village).count()

    # Calculate average state risk (sample first 100 villages to keep performance fast)
    sample_villages = db.query(Village).limit(100).all()
    total_score = 0.0
    for v in sample_villages:
        risk = _compute_village_risk(v, db)
        total_score += risk.overall_risk_score
    avg_score = round(total_score / len(sample_villages), 1) if sample_villages else 0.0

    # Top critical villages in the state
    critical_villages = []
    from app.models.domains import HealthRecord
    flagged_health = db.query(HealthRecord).filter(HealthRecord.maternal_mortality_flag > 0).limit(5).all()
    for fh in flagged_health:
        v = fh.village
        if v:
            risk = _compute_village_risk(v, db)
            critical_villages.append({
                "id": v.id,
                "name": v.name,
                "mandal_name": v.mandal.name if v.mandal else "Unknown",
                "district_name": v.mandal.district.name if v.mandal and v.mandal.district else "Unknown",
                "risk_score": risk.overall_risk_score,
                "risk_level": risk.overall_risk_level
            })

    district_summaries = []
    for d in districts:
        district_summaries.append({
            "id": d.id,
            "name": d.name,
        })

    return {
        "stateInfo": {
            "name": "Telangana State",
        },
        "stats": {
            "totalDistricts": len(districts),
            "totalMandals": mandals_count,
            "totalVillages": villages_count,
            "averageRiskScore": avg_score,
        },
        "districts": district_summaries,
        "criticalVillages": critical_villages
    }
