from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    state = Column(String(150), nullable=False, default="Telangana")
    lgd_code = Column(String(20), nullable=True, unique=True)  # official LGD district code, if seeded from LGD

    mandals = relationship("Mandal", back_populates="district", cascade="all, delete-orphan")
    users = relationship("User", back_populates="district", foreign_keys="User.district_id")

    __table_args__ = (UniqueConstraint("name", "state", name="uq_district_name_state"),)


class Mandal(Base):
    __tablename__ = "mandals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    district_id = Column(Integer, ForeignKey("districts.id"), nullable=False)
    lgd_code = Column(String(20), nullable=True, unique=True)  # official LGD sub-district code, if seeded

    district = relationship("District", back_populates="mandals")
    villages = relationship("Village", back_populates="mandal", cascade="all, delete-orphan")
    users = relationship("User", back_populates="mandal", foreign_keys="User.mandal_id")

    __table_args__ = (UniqueConstraint("name", "district_id", name="uq_mandal_name_district"),)
