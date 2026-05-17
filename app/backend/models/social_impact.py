"""
Models for tracking social and environmental impact.
"""
from pydantic import BaseModel, model_validator

from uuid import UUID
from typing import Optional

class SocialImpactResponse(BaseModel):
    impactID: UUID
    purchaseID: Optional[UUID] = None
    donationID: Optional[UUID] = None
    carbonOffset: float
    rescuedKilos: float
    peopleFed: int

    @model_validator(mode='after')
    def check_exactly_one_source(self):
        # Prevent both being provided (data integrity error)
        if self.purchaseID is not None and self.donationID is not None:
            raise ValueError('Social impact cannot be linked to both a purchase and a donation')
        
        # We allow both being None for legacy compatibility (pre-migration 20260514000003).
        # New records should always have one or the other, enforced at the service level.
        return self

    class Config:
        from_attributes = True

class SocialImpactSummary(BaseModel):
    totalCarbonOffset: float
    totalRescuedKilos: float
    totalPeopleFed: int
    purchaseCount: int
    donationCount: int

class GlobalImpactResponse(BaseModel):
    totalCarbonOffset: float
    totalRescuedKilos: float
    totalPeopleFed: int
    totalEvents: int
