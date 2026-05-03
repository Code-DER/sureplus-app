from pydantic import BaseModel
from typing import List

class PurchasrItemsInput(BaseModel):
    foordID: str
    quantity: int

class PurchaseCreate(BaseModel):
    userID: str
    paymentMethod: str
    items: List[PurchasrItemsInput]