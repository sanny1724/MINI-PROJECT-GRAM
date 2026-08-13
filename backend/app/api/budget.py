from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.village import Village
from app.models.budget import Budget
from app.models.user import RoleEnum
from app.auth.deps import require_roles

router = APIRouter(prefix="/api/villages/{village_id}/budget", tags=["budget"])


class BudgetIn(BaseModel):
    domain: str
    financial_year: str
    allocated_amount: float
    utilized_amount: float = 0
    scheme_name: str | None = None


class BudgetOut(BudgetIn):
    id: int
    village_id: int

    class Config:
        from_attributes = True


@router.get("/", response_model=List[BudgetOut])
def list_budget(village_id: int, db: Session = Depends(get_db)):
    return db.query(Budget).filter(Budget.village_id == village_id).all()


@router.post(
    "/",
    response_model=BudgetOut,
    dependencies=[Depends(require_roles([RoleEnum.panchayat, RoleEnum.collector]))],
)
def add_budget(village_id: int, payload: BudgetIn, db: Session = Depends(get_db)):
    village = db.query(Village).filter(Village.id == village_id).first()
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")

    budget = Budget(village_id=village_id, **payload.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget
