from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func

from sqlalchemy.orm import relationship
from app.core.database import Base


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    village_id = Column(Integer, ForeignKey("villages.id"), nullable=False)
    domain = Column(String(100), nullable=False)  # water, education, health, crop, governance
    financial_year = Column(String(20), nullable=False)  # e.g. "2025-26"
    allocated_amount = Column(Float, nullable=False, default=0)
    utilized_amount = Column(Float, nullable=False, default=0)
    scheme_name = Column(String(150), nullable=True)  # e.g. Jal Jeevan Mission, PMGSY
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    village = relationship("Village", back_populates="budgets")
