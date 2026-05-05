from pydantic import BaseModel
from typing import List

class PurchaseItemsInput(BaseModel):
    foodID: str
    quantity: int

class PurchaseCreate(BaseModel):
    userID: str
    paymentMethod: str
    items: List[PurchaseItemsInput]