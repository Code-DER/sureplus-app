"""
Models for purchase transactions.
"""
from pydantic import BaseModel

from uuid import UUID
from datetime import datetime
from typing import List, Literal, Optional
from models.product import FoodResponse

class PurchaseBase(BaseModel):
    foodID: str
    quantity: int
    paymentMethod: Literal["Cash", "Online Payment"] = "Cash"
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
    Food: Optional[FoodResponse] = None

    class Config:
        from_attributes = True

class PurchaseWithItemsResponse(PurchaseResponse):
    PurchaseItems: List[PurchaseItemResponse]

class PurchaseItemCreate(BaseModel):
    foodID: UUID
    quantity: int
    totalPerItem: float

class PurchaseCreateWithItems(BaseModel):
    paymentMethod: Optional[str] = None
    totalPrice: float
    items: List[PurchaseItemCreate]
