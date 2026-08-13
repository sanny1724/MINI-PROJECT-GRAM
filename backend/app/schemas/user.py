from typing import Optional
from pydantic import BaseModel, EmailStr

from app.models.user import RoleEnum


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    role: RoleEnum = RoleEnum.citizen
    village_id: Optional[int] = None   # citizen / panchayat
    mandal_id: Optional[int] = None    # tahsildar
    district_id: Optional[int] = None  # collector


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: RoleEnum
    village_id: Optional[int] = None
    mandal_id: Optional[int] = None
    district_id: Optional[int] = None
    must_reset_password: bool = False

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    must_reset_password: bool = False
    role: Optional[RoleEnum] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PasswordResetRequest(BaseModel):
    current_password: str
    new_password: str
