from pydantic import BaseModel
from typing import List, Literal
from datetime import datetime
from uuid import UUID

"""
Models for purchase transactions.
"""
class PurchaseItemCreate(BaseModel):
    foodID: UUID
    quantity: int

class PurchaseBase(BaseModel):
    paymentMethod: Literal["GCash" , "Cash on Delivery", "Maya"] = "GCash"

class PurchaseCreate(PurchaseBase):
    items: List[PurchaseItemCreate]
    
class PurchaseResponse(PurchaseBase):
    purchaseID: UUID
    userID: UUID
    purchaseDate: datetime

    class Config:
        from_attributes = True

class PurchaseItemResponse(BaseModel):
    purchaseID: UUID
    foodID: UUID
    quantity: int
    price: float
    totalPerItem: float

    class Config:
        from_attributes = True
