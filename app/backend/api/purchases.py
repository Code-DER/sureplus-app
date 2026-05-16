from fastapi import APIRouter, Depends
from models.purchase import PurchaseCreate
from api.dependency import get_current_user
from services.purchase_service import (
    create_purchase,
    complete_purchase,
    get_seller_purchase_list,
    get_seller_orders,
    get_buyer_orders,
)

router = APIRouter(prefix="/purchase")

@router.post("")
def create(data: PurchaseCreate, current_user: dict = Depends(get_current_user)):
    return create_purchase(data.model_dump(), user_id=current_user["userID"])

@router.put("/{purchase_id}/complete")
def complete(purchase_id: str):
    return complete_purchase(purchase_id)

@router.get("/buyer/orders")
def buyer_order_history(current_user: dict = Depends(get_current_user)):
    return get_buyer_orders(current_user["userID"])

@router.get("/seller/{seller_id}")
def seller_purchases(seller_id: str):
    return get_seller_purchase_list(seller_id)

@router.get("/seller/{seller_id}/orders")
def seller_orders(seller_id: str):
    return get_seller_orders(seller_id)
