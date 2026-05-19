from pydantic import BaseModel
from typing import List, Literal
from datetime import datetime
from uuid import UUID

# Model for an Item in a Purchase
class PurchaseItemCreate(BaseModel):
    foodID: UUID
    quantity: int

# Model for a Purchase
class PurchaseBase(BaseModel):
    paymentMethod: Literal["GCash" , "Cash on Delivery", "Maya"] = "GCash"

# Model for creating a purchase
class PurchaseCreate(PurchaseBase):
    items: List[PurchaseItemCreate]

# Model for the response of a Purchase
class PurchaseResponse(PurchaseBase):
    purchaseID: UUID
    userID: UUID
    purchaseDate: datetime

    class Config:
        from_attributes = True

# Model for the response of an item in a purchase
class PurchaseItemResponse(BaseModel):
    purchaseID: UUID
    foodID: UUID
    quantity: int
    price: float
    totalPerItem: float

    class Config:
        from_attributes = True
