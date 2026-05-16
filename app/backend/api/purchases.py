from fastapi import APIRouter
from models.purchase import PurchaseCreate
from services.purchase_service import (
    create_purchase,
    complete_purchase,
    get_seller_purchase_list,
    get_seller_orders,
)

router = APIRouter()

@router.post("/purchase")
def create(data: PurchaseCreate):
    return create_purchase(data.model_dump())

@router.put("/purchase/{purchase_id}/complete")
def complete(purchase_id: str):
    return complete_purchase(purchase_id)


@router.get("/purchase/seller/{seller_id}")
def seller_purchases(seller_id: str):
    return get_seller_purchase_list(seller_id)

@router.get("/purchase/seller/{seller_id}/orders")
def seller_orders(seller_id: str):
    return get_seller_orders(seller_id)