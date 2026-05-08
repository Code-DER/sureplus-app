from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class RatingCreate(BaseModel):
    purchaseID: UUID
    sellerID: UUID
    rating: int        # 1–5
    comment: Optional[str] = None

class RatingResponse(BaseModel):
    ratingID: UUID
    purchaseID: UUID
    buyerID: UUID
    sellerID: UUID
    rating: int
    comment: Optional[str]
    createdAt: datetime

    class Config:
        from_attributes = True

class RatingUpdate(BaseModel):
    rating: int
    comment: Optional[str] = None
