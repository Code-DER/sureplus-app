"""
Models for charity organizations.
"""
from pydantic import BaseModel
from uuid import UUID
from models.user import UserResponse

from typing import Optional

class CharityResponse(BaseModel):
    userID: UUID
    organizationName: str
    isPartner: bool = False

class CharityUpdate(BaseModel):
    organizationName: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    phoneNumber: Optional[str] = None
    street: Optional[str] = None
    barangay: Optional[str] = None
    city: Optional[str] = None

class CharityProfileResponse(UserResponse):
    organizationName: str
    isPartner: bool = False
