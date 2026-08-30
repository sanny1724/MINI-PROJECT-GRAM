import enum
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, Boolean, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class RoleEnum(str, enum.Enum):
    citizen = "citizen"        # monitors/uses their own village
    panchayat = "panchayat"    # manages a single village
    tahsildar = "tahsildar"    # monitors a mandal (all villages within it)
    collector = "collector"    # monitors a district (all mandals within it)
    state = "state"            # monitors the entire state (highest administrative dashboard)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.citizen)

    # Exactly one of these is populated depending on role:
    # citizen/panchayat -> village_id, tahsildar -> mandal_id, collector -> district_id
    village_id = Column(Integer, ForeignKey("villages.id"), nullable=True)
    mandal_id = Column(Integer, ForeignKey("mandals.id"), nullable=True)
    district_id = Column(Integer, ForeignKey("districts.id"), nullable=True)

    # True for accounts bulk-provisioned by admin scripts (panchayat/tahsildar/
    # collector placeholders) until the real official logs in and sets their
    # own password. Always False for citizen self-registrations.
    must_reset_password = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    village = relationship("Village", back_populates="users", foreign_keys=[village_id])
    mandal = relationship("Mandal", back_populates="users", foreign_keys=[mandal_id])
    district = relationship("District", back_populates="users", foreign_keys=[district_id])
