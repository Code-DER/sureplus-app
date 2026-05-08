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
    description: Optional[str] = None

class CharityUpdate(BaseModel):
    organizationName: Optional[str] = None
    description: Optional[str] = None

class CharityProfileResponse(UserResponse):
    organizationName: str
    description: Optional[str] = None
