from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field

# Model for Allergen Information
class AllergenBase(BaseModel):
    name: str = Field(..., min_length=1)

# Model for Creating an Allergen
class AllergenCreate(AllergenBase):
    pass

# Model for the response of an Allergen
class AllergenResponse(AllergenBase):
    allergenID: UUID

# Model for the Food Item
class FoodBase(BaseModel):
    foodName: str = Field(..., min_length=1)
    description: Optional[str] = None
    picture: Optional[str] = None
    isEdible: bool = True
    price: Decimal = Field(..., ge=0)
    stockQuantity: int = Field(..., ge=0)
    expirationDate: Optional[date] = None

# Model for Creating a Food Item
class FoodCreate(FoodBase):
    description: str = Field(..., min_length=1)
    picture: str = Field(..., min_length=1)
    expirationDate: date
    allergenIDs: List[UUID] = Field(default_factory=list)

# Model for Updating a Food Item
class FoodUpdate(BaseModel):
    foodName: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = Field(default=None, min_length=1)
    picture: Optional[str] = Field(default=None, min_length=1)
    isEdible: Optional[bool] = None
    price: Optional[Decimal] = Field(default=None, ge=0)
    stockQuantity: Optional[int] = Field(default=None, ge=0)
    expirationDate: Optional[date] = None
    allergenIDs: Optional[List[UUID]] = None

# Model for the response of a Food Item
class FoodResponse(FoodBase):
    foodID: UUID
    userID: UUID
    createdAt: Optional[datetime] = None
    allergens: List[AllergenResponse] = Field(default_factory=list)
    isSafeForCurrentUser: Optional[bool] = None
    matchedAllergenIDs: List[UUID] = Field(default_factory=list)

# Model for a User's Allergies Update
class UserAllergiesUpdate(BaseModel):
    allergenIDs: List[UUID] = Field(default_factory=list)

# Model for a User's Allergies
class UserAllergiesResponse(BaseModel):
    userID: UUID
    allergens: List[AllergenResponse] = Field(default_factory=list)
