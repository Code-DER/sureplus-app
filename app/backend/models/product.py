from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class AllergenBase(BaseModel):
    name: str = Field(..., min_length=1)


class AllergenCreate(AllergenBase):
    pass


class AllergenResponse(AllergenBase):
    allergenID: UUID


class FoodBase(BaseModel):
    foodName: str = Field(..., min_length=1)
    description: Optional[str] = None
    picture: Optional[str] = None
    isEdible: bool = True
    price: Decimal = Field(..., ge=0)
    stockQuantity: int = Field(..., ge=0)
    expirationDate: Optional[date] = None


class FoodCreate(FoodBase):
    description: str = Field(..., min_length=1)
    picture: str = Field(..., min_length=1)
    expirationDate: date
    allergenIDs: List[UUID] = Field(default_factory=list)


class FoodUpdate(BaseModel):
    foodName: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = Field(default=None, min_length=1)
    picture: Optional[str] = Field(default=None, min_length=1)
    isEdible: Optional[bool] = None
    price: Optional[Decimal] = Field(default=None, ge=0)
    stockQuantity: Optional[int] = Field(default=None, ge=0)
    expirationDate: Optional[date] = None
    allergenIDs: Optional[List[UUID]] = None


class FoodResponse(FoodBase):
    foodID: UUID
    userID: UUID
    createdAt: Optional[datetime] = None
    allergens: List[AllergenResponse] = Field(default_factory=list)
    isSafeForCurrentUser: Optional[bool] = None
    matchedAllergenIDs: List[UUID] = Field(default_factory=list)


class UserAllergiesUpdate(BaseModel):
    allergenIDs: List[UUID] = Field(default_factory=list)


class UserAllergiesResponse(BaseModel):
    userID: UUID
    allergens: List[AllergenResponse] = Field(default_factory=list)
