"""
Models for charity organizations.
"""
from pydantic import BaseModel
from uuid import UUID
from models.user import UserResponse

class CharityResponse(BaseModel):
    userID: UUID
    organizationName: str
    isPartner: bool = False

class CharityUpdate(BaseModel):
    organizationName: str

class CharityProfileResponse(UserResponse):
    organizationName: str
    isPartner: bool = False
