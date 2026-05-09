from fastapi import APIRouter, Depends
from models.purchase import PurchaseCreate
from api.dependency import get_current_user
from services.purchase_service import (
    create_purchase,
    complete_purchase,
    get_seller_purchase_list
)

router = APIRouter()

@router.post("/purchase")
def create(data: PurchaseCreate, current_user: dict = Depends(get_current_user)):
    return create_purchase(data.model_dump(), user_id=current_user["user_id"])

@router.put("/purchase/{purchase_id}/complete")
def complete(purchase_id: str):
    return complete_purchase(purchase_id)


@router.get("/purchase/seller/{seller_id}")
def seller_orders(seller_id: str):
    return get_seller_purchase_list(seller_id)