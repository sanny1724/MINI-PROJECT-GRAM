from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.village import Village, Official
from app.models.geo import Mandal
from app.models.user import RoleEnum
from app.schemas.village import VillageCreate, VillageOut, OfficialCreate, OfficialOut
from app.auth.deps import require_roles

router = APIRouter(prefix="/api/villages", tags=["villages"])


def _village_out(v: Village) -> VillageOut:
    mandal = v.mandal
    district = mandal.district if mandal else None
    return VillageOut(
        id=v.id,
        name=v.name,
        mandal_id=v.mandal_id,
        mandal_name=mandal.name if mandal else None,
        district_id=district.id if district else None,
        district_name=district.name if district else None,
        lgd_code=v.lgd_code,
        population=v.population,
        latitude=v.latitude,
        longitude=v.longitude,
        officials=[OfficialOut.model_validate(o) for o in v.officials],
    )


@router.get("/", response_model=List[VillageOut])
def list_villages(mandal_id: int | None = None, district_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Village)
    if mandal_id:
        query = query.filter(Village.mandal_id == mandal_id)
    elif district_id:
        query = query.join(Mandal).filter(Mandal.district_id == district_id)
    return [_village_out(v) for v in query.all()]


@router.get("/{village_id}", response_model=VillageOut)
def get_village(village_id: int, db: Session = Depends(get_db)):
    village = db.query(Village).filter(Village.id == village_id).first()
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")
    return _village_out(village)


@router.post(
    "/", response_model=VillageOut,
    dependencies=[Depends(require_roles([RoleEnum.collector, RoleEnum.tahsildar]))],
)
def create_village(payload: VillageCreate, db: Session = Depends(get_db)):
    mandal = db.query(Mandal).filter(Mandal.id == payload.mandal_id).first()
    if not mandal:
        raise HTTPException(status_code=404, detail="Mandal not found")
    village = Village(**payload.model_dump())
    db.add(village)
    db.commit()
    db.refresh(village)
    return _village_out(village)


@router.post(
    "/{village_id}/officials",
    response_model=OfficialOut,
    dependencies=[Depends(require_roles([RoleEnum.collector, RoleEnum.tahsildar, RoleEnum.panchayat]))],
)
def add_official(village_id: int, payload: OfficialCreate, db: Session = Depends(get_db)):
    village = db.query(Village).filter(Village.id == village_id).first()
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")
    official = Official(village_id=village_id, **payload.model_dump())
    db.add(official)
    db.commit()
    db.refresh(official)
    return official
