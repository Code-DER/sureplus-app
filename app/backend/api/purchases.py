from fastapi import APIRouter, Depends, HTTPException
from models.purchase import PurchaseCreate
from api.dependency import get_current_user
from services.purchase_service import (
    create_purchase,
    complete_purchase,
    approve_purchase,
    get_seller_purchase_list,
    get_buyer_food_list,
    get_seller_orders,
    get_buyer_orders,
    fetch_purchase_owner,
)
from api.dependency import require_role

router = APIRouter(prefix="/purchase")

@router.post("")
def create(data: PurchaseCreate, current_user: dict = Depends(require_role("buyer", "seller"))):
    return create_purchase(data.model_dump(mode='json'), user_id=current_user["userID"])

@router.put("/{purchase_id}/complete")
def complete(purchase_id: str, current_user: dict = Depends(get_current_user)):
    # Ownership check: only the purchase owner should be able to complete it
    owner_id = fetch_purchase_owner(purchase_id)
    if not owner_id or owner_id != current_user["userID"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return complete_purchase(purchase_id)

@router.patch("/{purchase_id}/approve")
def approve(purchase_id: str, current_user: dict = Depends(require_role("seller"))):
    """Seller approves a pending order from their shop."""
    return approve_purchase(purchase_id, current_user["userID"])

@router.get("/my-food")
def get_my_food(current_user: dict = Depends(require_role("buyer"))):
    """
    Returns food items the buyer has purchased that can be donated.
    """
    return get_buyer_food_list(current_user["userID"])

@router.get("/buyer/orders")
def buyer_order_history(current_user: dict = Depends(get_current_user)):
    return get_buyer_orders(current_user["userID"])

@router.get("/seller/{seller_id}")
def seller_purchases(seller_id: str, current_user: dict = Depends(get_current_user)):
    return get_seller_purchase_list(seller_id)

@router.get("/seller/{seller_id}/orders")
def seller_orders(seller_id: str, current_user: dict = Depends(get_current_user)):
    return get_seller_orders(seller_id)
