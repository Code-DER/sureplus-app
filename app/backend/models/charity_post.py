"""
Models for charity donation posts.
"""
from pydantic import BaseModel

from uuid import UUID
from datetime import datetime
from typing import Optional

class CharityPostCreate(BaseModel):
    title: str
    description: Optional[str] = None
    amountNeeded: float

class CharityPostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    amountNeeded: Optional[float] = None

class CharityPostResponse(BaseModel):
    charityID: UUID
    userID: UUID
    title: str
    description: Optional[str] = None
    currentAmount: float
    amountNeeded: float
    createdAt: datetime

class CharityPostDonateRequest(BaseModel):
    amount: float
