from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func, Index
from sqlalchemy.orm import relationship

from app.core.database import Base


class Village(Base):
    __tablename__ = "villages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    mandal_id = Column(Integer, ForeignKey("mandals.id"), nullable=False, index=True)
    lgd_code = Column(String(20), nullable=True, unique=True, index=True)  # official LGD village code
    population = Column(Integer, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    mandal = relationship("Mandal", back_populates="villages")
    users = relationship("User", back_populates="village", foreign_keys="User.village_id")
    officials = relationship("Official", back_populates="village", cascade="all, delete-orphan")
    water_records = relationship("WaterRecord", back_populates="village", cascade="all, delete-orphan")
    education_records = relationship("EducationRecord", back_populates="village", cascade="all, delete-orphan")
    health_records = relationship("HealthRecord", back_populates="village", cascade="all, delete-orphan")
    crop_records = relationship("CropRecord", back_populates="village", cascade="all, delete-orphan")
    grievances = relationship("Grievance", back_populates="village", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="village", cascade="all, delete-orphan")

    __table_args__ = (Index("idx_village_name_mandal", "name", "mandal_id"),)


class Official(Base):
    __tablename__ = "officials"

    id = Column(Integer, primary_key=True, index=True)
    village_id = Column(Integer, ForeignKey("villages.id"), nullable=False)
    name = Column(String(150), nullable=False)
    designation = Column(String(100), nullable=False)  # Sarpanch, Secretary, Mandal Officer, etc.
    phone = Column(String(20), nullable=True)
    email = Column(String(150), nullable=True)

    village = relationship("Village", back_populates="officials")
