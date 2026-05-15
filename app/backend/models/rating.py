from typing import Optional
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

class RatingCreate(BaseModel):
    purchaseID: Optional[UUID] = None
    donationID: Optional[UUID] = None
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=500)

class RatingResponse(BaseModel):
    ratingID: UUID
    purchaseID: Optional[UUID]
    donationID: Optional[UUID]
    buyerID: UUID  # rater
    sellerID: UUID # target
    rating: int
    comment: Optional[str]
    createdAt: datetime

    class Config:
        from_attributes = True