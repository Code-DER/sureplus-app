from typing import Literal, Optional
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

# Donation Types
DonationType = Literal['money', 'food', 'food_direct']

# Model for the response of a Donation
class DonationResponse(BaseModel):
    donationID: UUID
    postID: UUID
    userID: Optional[UUID]
    donationType: DonationType
    amount: Optional[float] = None
    foodID: Optional[UUID] = None
    quantity: Optional[int] = None
    foodKg: Optional[float] = None
    status: str = 'completed'
    createdAt: datetime
    # Joined info
    donorName: Optional[str] = None
    postTitle: Optional[str] = None
    isRated: bool = False

    class Config:
        from_attributes = True
