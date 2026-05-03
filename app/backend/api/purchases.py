from fastapi import APIRouter
from models.purchase import PurchaseCreate
from services.purchase_service import create_purchase

router = APIRouter()

@router.post("/purchase")
def create(data: PurchaseCreate):
    return create_purchase(data.model_dump())