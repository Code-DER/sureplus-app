from pydantic import BaseModel
from typing import List

"""
Models for purchase transactions.
"""
from pydantic import BaseModel

from uuid import UUID
from datetime import datetime
from typing import Optional, List, Literal

class PurchaseBase(BaseModel):
    foodID: str
    quantity: int
    paymentMethod: Literal["Cash" , "Online Payment"] = "Cash"
    status: Literal["pending", "completed", "cancelled", "refunded"] = "pending"

class PurchaseCreate(PurchaseBase):
    userID: UUID

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
    totalPerItem: float

    class Config:
        from_attributes = True
