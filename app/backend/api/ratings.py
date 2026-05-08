from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from api.dependency import get_current_user, require_role
from models.rating import RatingCreate, RatingResponse, RatingUpdate
from services import rating_service, purchase_service

router = APIRouter()

@router.post("/", response_model=RatingResponse)
async def create_rating(
    data: RatingCreate,
    current_user: dict = Depends(require_role("buyer"))
):
    # Check if purchase exists and belongs to buyer
    purchase_res = purchase_service.fetch_purchase_by_id(str(data.purchaseID))
    if not purchase_res.data:
        raise HTTPException(status_code=404, detail="Purchase not found.")
    
    if purchase_res.data["userID"] != current_user["userID"]:
        raise HTTPException(status_code=403, detail="You can only rate your own purchases.")
    
    # Check if already rated
    existing_rating = rating_service.fetch_rating_by_purchase(str(data.purchaseID))
    if existing_rating.data:
        raise HTTPException(status_code=400, detail="Purchase already rated.")
        
    response = rating_service.create_rating(current_user["userID"], data)
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to submit rating.")
    
    return response.data[0]

@router.get("/seller/{seller_id}", response_model=List[RatingResponse])
async def list_seller_ratings(seller_id: UUID):
    response = rating_service.fetch_ratings_by_seller(str(seller_id))
    return response.data

@router.get("/purchase/{purchase_id}", response_model=RatingResponse)
async def get_purchase_rating(purchase_id: UUID):
    response = rating_service.fetch_rating_by_purchase(str(purchase_id))
    if not response.data:
        raise HTTPException(status_code=404, detail="Rating not found.")
    return response.data

@router.put("/{rating_id}", response_model=RatingResponse)
async def update_rating(
    rating_id: UUID,
    data: RatingUpdate,
    current_user: dict = Depends(require_role("buyer"))
):
    response = rating_service.update_rating(str(rating_id), current_user["userID"], data)
    if not response.data:
        raise HTTPException(status_code=404, detail="Rating not found or access denied.")
    return response.data[0]

@router.delete("/{rating_id}")
async def delete_rating(
    rating_id: UUID,
    current_user: dict = Depends(require_role("buyer"))
):
    response = rating_service.delete_rating(str(rating_id), current_user["userID"])
    if not response.data:
        raise HTTPException(status_code=404, detail="Rating not found or access denied.")
    return {"message": "Rating deleted successfully."}
