"""
Models for tracking social and environmental impact.
"""
from pydantic import BaseModel

from uuid import UUID
from typing import Optional

class SocialImpactResponse(BaseModel):
    impactID: UUID
    purchaseID: UUID
    carbonOffset: float
    rescuedKilos: float
    peopleFed: int

    class Config:
        from_attributes = True

class SocialImpactSummary(BaseModel):
    totalCarbonOffset: float
    totalRescuedKilos: float
    totalPeopleFed: int
    purchaseCount: int
