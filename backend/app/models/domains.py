from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class WaterRecord(Base):
    __tablename__ = "water_records"

    id = Column(Integer, primary_key=True, index=True)
    village_id = Column(Integer, ForeignKey("villages.id"), nullable=False)
    households_covered = Column(Integer, nullable=True)
    households_total = Column(Integer, nullable=True)
    source_type = Column(String(100), nullable=True)  # borewell, pipeline, tanker, etc.
    quality_index = Column(Float, nullable=True)  # 0-100, higher is better
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

    village = relationship("Village", back_populates="water_records")


class EducationRecord(Base):
    __tablename__ = "education_records"

    id = Column(Integer, primary_key=True, index=True)
    village_id = Column(Integer, ForeignKey("villages.id"), nullable=False)
    schools_count = Column(Integer, nullable=True)
    enrollment_rate = Column(Float, nullable=True)  # %
    dropout_rate = Column(Float, nullable=True)  # %
    teacher_student_ratio = Column(Float, nullable=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

    village = relationship("Village", back_populates="education_records")


class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    village_id = Column(Integer, ForeignKey("villages.id"), nullable=False)
    phc_distance_km = Column(Float, nullable=True)
    immunization_rate = Column(Float, nullable=True)  # %
    maternal_mortality_flag = Column(Integer, nullable=True)  # count of flagged cases
    malnutrition_rate = Column(Float, nullable=True)  # %
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

    village = relationship("Village", back_populates="health_records")


class CropRecord(Base):
    __tablename__ = "crop_records"

    id = Column(Integer, primary_key=True, index=True)
    village_id = Column(Integer, ForeignKey("villages.id"), nullable=False)
    primary_crop = Column(String(100), nullable=True)
    irrigation_coverage = Column(Float, nullable=True)  # %
    avg_yield_per_acre = Column(Float, nullable=True)
    rainfall_deviation_pct = Column(Float, nullable=True)  # deviation from normal
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

    village = relationship("Village", back_populates="crop_records")


class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(Integer, primary_key=True, index=True)
    village_id = Column(Integer, ForeignKey("villages.id"), nullable=False)
    filed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    category = Column(String(100), nullable=False)  # water, education, health, crop, governance
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="open")  # open, in_progress, escalated, resolved
    escalated_to_collector = Column(Integer, nullable=False, default=0)  # 0/1 boolean flag
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    village = relationship("Village", back_populates="grievances")
