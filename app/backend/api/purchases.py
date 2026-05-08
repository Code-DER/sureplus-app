from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from api.dependency import get_current_user
from models.purchase import PurchaseResponse, PurchaseCreateWithItems, PurchaseWithItemsResponse
from services import purchase_service

router = APIRouter()

def require_buyer(current_user: dict) -> str:
    if current_user["role"] != "buyer":
        raise HTTPException(status_code=403, detail="Buyer access is required.")
    return current_user["userID"]

@router.post("/", response_model=PurchaseResponse)
async def create_purchase(
    data: PurchaseCreateWithItems, 
    current_user: dict = Depends(get_current_user)
):
    buyer_id = require_buyer(current_user)
    result = purchase_service.create_purchase(buyer_id, data)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to create purchase.")
    return result

@router.get("/", response_model=List[PurchaseResponse])
async def list_purchases(current_user: dict = Depends(get_current_user)):
    buyer_id = require_buyer(current_user)
    response = purchase_service.fetch_all_purchases(buyer_id)
    return response.data

@router.get("/{purchase_id}", response_model=PurchaseWithItemsResponse)
async def get_purchase(
    purchase_id: UUID, 
    current_user: dict = Depends(get_current_user)
):
    buyer_id = require_buyer(current_user)
    response = purchase_service.fetch_purchase_by_id(str(purchase_id))
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Purchase not found.")
    
    # Ensure buyer owns this purchase
    if response.data["userID"] != buyer_id:
        raise HTTPException(status_code=403, detail="Access denied.")
        
    return response.data

@router.patch("/{purchase_id}/cancel")
async def cancel_purchase(
    purchase_id: UUID, 
    current_user: dict = Depends(get_current_user)
):
    buyer_id = require_buyer(current_user)
    
    # Check if purchase exists and belongs to buyer
    check_res = purchase_service.fetch_purchase_by_id(str(purchase_id))
    if not check_res.data:
        raise HTTPException(status_code=404, detail="Purchase not found.")
    
    if check_res.data["userID"] != buyer_id:
        raise HTTPException(status_code=403, detail="Access denied.")
    
    if check_res.data["status"] != "pending":
        raise HTTPException(status_code=400, detail="Only pending purchases can be cancelled.")
        
    result = purchase_service.cancel_purchase(str(purchase_id))
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to cancel purchase.")
        
    return {"message": "Purchase cancelled successfully."}
