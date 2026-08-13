from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.geo import District, Mandal
from app.models.village import Village
from app.models.user import RoleEnum
from app.schemas.village import DistrictOut, DistrictCreate, MandalOut, MandalCreate
from app.auth.deps import require_roles

router = APIRouter(prefix="/api/geo", tags=["geo"])


def _district_out(d: District, db: Session) -> DistrictOut:
    count = db.query(func.count(Mandal.id)).filter(Mandal.district_id == d.id).scalar()
    return DistrictOut(id=d.id, name=d.name, state=d.state, lgd_code=d.lgd_code, mandal_count=count)


def _mandal_out(m: Mandal, db: Session) -> MandalOut:
    count = db.query(func.count(Village.id)).filter(Village.mandal_id == m.id).scalar()
    return MandalOut(
        id=m.id, name=m.name, district_id=m.district_id,
        district_name=m.district.name if m.district else None,
        lgd_code=m.lgd_code, village_count=count,
    )


@router.get("/districts", response_model=List[DistrictOut])
def list_districts(state: str | None = None, db: Session = Depends(get_db)):
    q = db.query(District)
    if state:
        q = q.filter(District.state == state)
    return [_district_out(d, db) for d in q.order_by(District.name).all()]


@router.post(
    "/districts", response_model=DistrictOut,
    dependencies=[Depends(require_roles([RoleEnum.collector]))],
)
def create_district(payload: DistrictCreate, db: Session = Depends(get_db)):
    existing = db.query(District).filter(
        District.name == payload.name, District.state == payload.state
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="District already exists")
    d = District(**payload.model_dump())
    db.add(d)
    db.commit()
    db.refresh(d)
    return _district_out(d, db)


@router.get("/districts/{district_id}/mandals", response_model=List[MandalOut])
def list_mandals(district_id: int, db: Session = Depends(get_db)):
    mandals = db.query(Mandal).filter(Mandal.district_id == district_id).order_by(Mandal.name).all()
    return [_mandal_out(m, db) for m in mandals]


@router.post(
    "/mandals", response_model=MandalOut,
    dependencies=[Depends(require_roles([RoleEnum.collector]))],
)
def create_mandal(payload: MandalCreate, db: Session = Depends(get_db)):
    district = db.query(District).filter(District.id == payload.district_id).first()
    if not district:
        raise HTTPException(status_code=404, detail="District not found")
    existing = db.query(Mandal).filter(
        Mandal.name == payload.name, Mandal.district_id == payload.district_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Mandal already exists in this district")
    m = Mandal(**payload.model_dump())
    db.add(m)
    db.commit()
    db.refresh(m)
    return _mandal_out(m, db)


@router.get("/mandals/{mandal_id}/villages")
def list_villages_in_mandal(mandal_id: int, db: Session = Depends(get_db)):
    villages = db.query(Village).filter(Village.mandal_id == mandal_id).order_by(Village.name).all()
    return [{"id": v.id, "name": v.name, "population": v.population, "code": v.id, "riskLevel": "LOW", "developmentScore": 75} for v in villages]


@router.get("/search")
def search_entities(q: str, db: Session = Depends(get_db)):
    if not q or len(q) < 2:
        return []
    
    # Search districts
    districts = db.query(District).filter(District.name.ilike(f"%{q}%")).limit(5).all()
    # Search mandals
    mandals = db.query(Mandal).filter(Mandal.name.ilike(f"%{q}%")).limit(5).all()
    # Search villages
    villages = db.query(Village).filter(Village.name.ilike(f"%{q}%")).limit(10).all()

    results = []
    for d in districts:
        results.append({
            "type": "District",
            "name": d.name,
            "code": str(d.id),
            "context": f"{d.state} State"
        })
    for m in mandals:
        dist_name = m.district.name if m.district else "Unknown"
        results.append({
            "type": "Mandal",
            "name": m.name,
            "code": str(m.id),
            "context": f"{dist_name} District"
        })
    for v in villages:
        mandal_name = v.mandal.name if v.mandal else "Unknown"
        dist_name = v.mandal.district.name if (v.mandal and v.mandal.district) else "Unknown"
        results.append({
            "type": "Village",
            "name": v.name,
            "code": str(v.id),
            "context": f"{mandal_name} Mandal, {dist_name} District"
        })
    return results
