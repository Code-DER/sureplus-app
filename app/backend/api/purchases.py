from fastapi import APIRouter, Depends
from models.purchase import PurchaseCreate
from services.purchase_service import (
    create_purchase,
    complete_purchase,
    get_seller_purchase_list,
    get_buyer_food_list
)
from api.dependency import require_role

router = APIRouter()

@router.post("/purchase")
def create(data: PurchaseCreate):
    return create_purchase(data.model_dump())

@router.put("/purchase/{purchase_id}/complete")
def complete(purchase_id: str):
    return complete_purchase(purchase_id)

@router.get("/my-food")
def get_my_food(current_user: dict = Depends(require_role("buyer"))):
    """
    Returns food items the buyer has purchased that can be donated.
    """
    return get_buyer_food_list(current_user["userID"])

@router.get("/purchase/seller/{seller_id}")
def seller_orders(seller_id: str):
    return get_seller_purchase_list(seller_id)