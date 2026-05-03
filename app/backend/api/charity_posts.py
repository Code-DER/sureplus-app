from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID

from models.charity_post import CharityPostCreate, CharityPostUpdate, CharityPostResponse, CharityPostDonateRequest
from services import charity_post_service
from api.dependency import get_current_user, require_role

router = APIRouter()

@router.get("/", response_model=List[CharityPostResponse])
async def get_all_posts():
    """Public endpoint to list all charity posts."""
    response = charity_post_service.fetch_all_posts()
    return response.data

@router.get("/by-user/{user_id}", response_model=List[CharityPostResponse])
async def get_posts_by_user(user_id: UUID):
    """Public endpoint to list all charity posts for a specific user (charity)."""
    # ... implementation
    response = charity_post_service.fetch_posts_by_user(str(user_id))
    return response.data

@router.get("/{charity_id}", response_model=CharityPostResponse)
async def get_post_by_id(charity_id: UUID):
    """Public endpoint to get a specific charity post."""
    # ... implementation
    response = charity_post_service.fetch_post_by_id(str(charity_id))
    if not response.data:
        raise HTTPException(status_code=404, detail="Charity post not found")
    return response.data

@router.post("/", response_model=CharityPostResponse)
async def create_new_post(
    post_data: CharityPostCreate,
    current_user: dict = Depends(require_role("charity"))
):
    """Auth required (charity role) endpoint to create a new charity post."""
    response = charity_post_service.create_post(current_user["userID"], post_data.model_dump())
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create charity post")
    return response.data[0]

@router.put("/{charity_id}", response_model=CharityPostResponse)
async def update_existing_post(
    charity_id: UUID,
    post_update: CharityPostUpdate,
    current_user: dict = Depends(require_role("charity"))
):
    """Auth required (charity role) endpoint to update a charity post with ownership check."""
    # Ownership check
    post_response = charity_post_service.fetch_post_by_id(str(charity_id))
    if not post_response.data:
        raise HTTPException(status_code=404, detail="Charity post not found")
    
    if post_response.data["userID"] != current_user["userID"]:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this post")
    
    response = charity_post_service.update_post(str(charity_id), post_update.model_dump(exclude_unset=True))
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update charity post")
    return response.data[0]

@router.delete("/{charity_id}")
async def delete_existing_post(
    charity_id: UUID,
    current_user: dict = Depends(require_role("charity"))
):
    """Auth required (charity role) endpoint to delete a charity post with ownership check."""
    # Ownership check
    post_response = charity_post_service.fetch_post_by_id(str(charity_id))
    if not post_response.data:
        raise HTTPException(status_code=404, detail="Charity post not found")
    
    if post_response.data["userID"] != current_user["userID"]:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this post")
    
    response = charity_post_service.delete_post(str(charity_id))
    if not response.data:
        # In Supabase, delete might return empty data if successful but nothing deleted, 
        # but here we already checked existence.
        pass
    return {"message": "Charity post deleted successfully"}

@router.post("/{charity_id}/donate", response_model=CharityPostResponse)
async def donate_to_post(
    charity_id: UUID,
    donation: CharityPostDonateRequest,
    current_user: dict = Depends(require_role("buyer"))
):
    """Auth required (buyer role) endpoint to donate to a charity post."""
    response = charity_post_service.increment_donation(str(charity_id), donation.amount)
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to process donation")
    return response.data[0]
