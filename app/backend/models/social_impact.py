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
        if (self.purchaseID is None) == (self.donationID is None):
            raise ValueError('Exactly one of purchaseID or donationID must be provided')
        return self

    class Config:
        from_attributes = True

class SocialImpactSummary(BaseModel):
    totalCarbonOffset: float
    totalRescuedKilos: float
    totalPeopleFed: int
    purchaseCount: int
    donationCount: int
