"""
Models for food items.
"""
from pydantic import BaseModel

from uuid import UUID
from datetime import datetime
from typing import Optional

class FoodBase(BaseModel):
    foodName: str
    description: Optional[str] = None
    picture: Optional[str] = None
    isEdible: bool = True
    price: float
    stockQuantity: int = 0
    expirationDate: Optional[str] = None
    weightKg: float = 0.5

class FoodCreate(FoodBase):
    pass

class FoodUpdate(BaseModel):
    foodName: Optional[str] = None
    description: Optional[str] = None
    picture: Optional[str] = None
    isEdible: Optional[bool] = None
    price: Optional[float] = None
    stockQuantity: Optional[int] = None
    expirationDate: Optional[str] = None
    weightKg: Optional[float] = None

class FoodResponse(FoodBase):
    foodID: UUID
    userID: UUID
    createdAt: datetime

    class Config:
        from_attributes = True
