from typing import Optional, List
from pydantic import BaseModel


class OfficialOut(BaseModel):
    id: int
    name: str
    designation: str
    phone: Optional[str] = None
    email: Optional[str] = None

    class Config:
        from_attributes = True


class OfficialCreate(BaseModel):
    name: str
    designation: str
    phone: Optional[str] = None
    email: Optional[str] = None


class VillageCreate(BaseModel):
    name: str
    mandal_id: int
    lgd_code: Optional[str] = None
    population: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class VillageOut(BaseModel):
    id: int
    name: str
    mandal_id: int
    mandal_name: Optional[str] = None
    district_id: Optional[int] = None
    district_name: Optional[str] = None
    lgd_code: Optional[str] = None
    population: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    officials: List[OfficialOut] = []

    class Config:
        from_attributes = True


class MandalOut(BaseModel):
    id: int
    name: str
    district_id: int
    district_name: Optional[str] = None
    lgd_code: Optional[str] = None
    village_count: Optional[int] = None

    class Config:
        from_attributes = True


class MandalCreate(BaseModel):
    name: str
    district_id: int
    lgd_code: Optional[str] = None


class DistrictOut(BaseModel):
    id: int
    name: str
    state: str
    lgd_code: Optional[str] = None
    mandal_count: Optional[int] = None

    class Config:
        from_attributes = True


class DistrictCreate(BaseModel):
    name: str
    state: str = "Telangana"
    lgd_code: Optional[str] = None
