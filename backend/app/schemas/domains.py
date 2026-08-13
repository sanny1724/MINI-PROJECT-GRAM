from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class WaterRecordIn(BaseModel):
    households_covered: Optional[int] = None
    households_total: Optional[int] = None
    source_type: Optional[str] = None
    quality_index: Optional[float] = None


class EducationRecordIn(BaseModel):
    schools_count: Optional[int] = None
    enrollment_rate: Optional[float] = None
    dropout_rate: Optional[float] = None
    teacher_student_ratio: Optional[float] = None


class HealthRecordIn(BaseModel):
    phc_distance_km: Optional[float] = None
    immunization_rate: Optional[float] = None
    maternal_mortality_flag: Optional[int] = None
    malnutrition_rate: Optional[float] = None


class CropRecordIn(BaseModel):
    primary_crop: Optional[str] = None
    irrigation_coverage: Optional[float] = None
    avg_yield_per_acre: Optional[float] = None
    rainfall_deviation_pct: Optional[float] = None


class GrievanceIn(BaseModel):
    category: str
    description: Optional[str] = None


class GrievanceOut(BaseModel):
    id: int
    village_id: int
    category: str
    description: Optional[str] = None
    status: str
    escalated_to_collector: int
    created_at: datetime

    class Config:
        from_attributes = True


class DomainRisk(BaseModel):
    domain: str
    risk_score: float  # 0-100, higher = more at-risk
    risk_level: str  # Low, Medium, High, Critical
    explanation: str


class VillageRiskSummary(BaseModel):
    village_id: int
    village_name: str
    overall_risk_score: float
    overall_risk_level: str
    domains: list[DomainRisk]
