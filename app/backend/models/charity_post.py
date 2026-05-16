"""
Models for charity donation posts.
"""
from typing import Literal, Optional
from pydantic import BaseModel, Field, model_validator
from uuid import UUID
from datetime import datetime

DonationMode = Literal['money', 'food', 'both']

class CharityPostCreate(BaseModel):
    title: str
    description: Optional[str] = Field(default=None, max_length=1000)
    imageUrl: Optional[str] = None
    donationMode: DonationMode = 'money'
    amountNeeded: Optional[float] = Field(default=None, gt=0)
    foodGoalKg: Optional[float] = Field(default=None, gt=0)

    @model_validator(mode='after')
    def check_goals(self):
        if self.donationMode in ('money', 'both') and self.amountNeeded is None:
            raise ValueError('amountNeeded is required for money or both mode')
        if self.donationMode in ('food', 'both') and self.foodGoalKg is None:
            raise ValueError('foodGoalKg is required for food or both mode')
        return self

class CharityPostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = Field(default=None, max_length=1000)
    imageUrl: Optional[str] = None
    amountNeeded: Optional[float] = Field(default=None, gt=0)
    foodGoalKg: Optional[float] = Field(default=None, gt=0)
    status: Optional[Literal['active', 'funded', 'closed']] = None
    # donationMode is intentionally not updatable after creation

class CharityPostResponse(BaseModel):
    charityID: UUID
    userID: UUID
    title: str
    description: Optional[str] = None
    imageUrl: Optional[str] = None
    donationMode: str = 'money'
    currentAmount: float = 0.0
    amountNeeded: Optional[float] = None
    currentFoodKg: float = 0.0
    foodGoalKg: Optional[float] = None
    status: str = 'active'
    isPartner: bool = False
    createdAt: datetime

    @model_validator(mode='before')
    @classmethod
    def flatten_charity(cls, data):
        if isinstance(data, dict) and 'Charity' in data:
            charity = data['Charity']
            if isinstance(charity, dict):
                data['isPartner'] = charity.get('isPartner', False)
        return data

class CharityPostDonateRequest(BaseModel):
    donationType: Literal['money', 'food']
    # Money fields
    amount: Optional[float] = Field(default=None, gt=0)
    # Food fields
    foodID: Optional[UUID] = None
    quantity: Optional[int] = Field(default=None, gt=0)

    @model_validator(mode='after')
    def check_fields(self):
        if self.donationType == 'money' and self.amount is None:
            raise ValueError('amount is required for money donations')
        if self.donationType == 'food' and (self.foodID is None or self.quantity is None):
            raise ValueError('foodID and quantity are required for food donations')
        return self
