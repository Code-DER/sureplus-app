from pydantic import BaseModel, model_validator
from uuid import UUID
from typing import Optional

# Model for the response of a social impact record
class SocialImpactResponse(BaseModel):
    impactID: UUID
    purchaseID: Optional[UUID] = None
    donationID: Optional[UUID] = None
    carbonOffset: float
    rescuedKilos: float
    peopleFed: int

    # Ensure that exactly one of purchaseID or donationID is provided
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

# Model for the summary of social impact metrics
class SocialImpactSummary(BaseModel):
    totalCarbonOffset: float
    totalRescuedKilos: float
    totalPeopleFed: int
    purchaseCount: int
    donationCount: int

# Model for the global impact metrics
class GlobalImpactResponse(BaseModel):
    totalCarbonOffset: float
    totalRescuedKilos: float
    totalPeopleFed: int
    totalEvents: int
