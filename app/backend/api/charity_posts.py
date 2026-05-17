import logging
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field

from database import supabase_admin
from models.charity_post import CharityPostCreate, CharityPostUpdate, CharityPostResponse, CharityPostDonateRequest, DirectFoodDonationCreate
from models.donation import DonationResponse
from services import charity_post_service, social_impact_service, notification_service, rating_service
from api.dependency import get_current_user, require_role

router = APIRouter()
logger = logging.getLogger(__name__)

class CharityRateDonorRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=500)

@router.get("/", response_model=List[CharityPostResponse])
async def get_all_posts(
    limit: int = 10,
    offset: int = 0,
    search: Optional[str] = None,
    donation_mode: Optional[str] = None,
    status: Optional[str] = None
):
    """Public endpoint to list all charity posts with pagination and search."""
    response = charity_post_service.fetch_all_posts(
        limit=limit, 
        offset=offset, 
        search=search,
        donation_mode=donation_mode,
        status=status
    )
    return response.data

@router.get("/by-user/{user_id}", response_model=List[CharityPostResponse])
async def get_posts_by_user(
    user_id: UUID,
    limit: int = 10,
    offset: int = 0
):
    """Public endpoint to list all charity posts for a specific user (charity)."""
    response = charity_post_service.fetch_posts_by_user(str(user_id), limit=limit, offset=offset)
    return response.data

@router.get("/by-user/{user_id}/stats")
async def get_user_post_stats(user_id: UUID):
    """Public endpoint to get aggregate statistics for a user's charity posts."""
    return charity_post_service.fetch_user_post_stats(str(user_id))

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

class CharityDonationResult(BaseModel):
    post: CharityPostResponse
    donationID: Optional[UUID] = None

@router.post("/{charity_id}/donate", response_model=CharityDonationResult)
async def donate_to_post(
    charity_id: UUID,
    donation: CharityPostDonateRequest,
    current_user: dict = Depends(require_role("buyer"))
):
    """Auth required (buyer role) endpoint to donate to a charity post."""
    post_id = str(charity_id)
    user_id = current_user["userID"]
    donation_id = None

    if donation.donationType == 'money':
        raise HTTPException(status_code=400, detail="Money donations are currently disabled. Please donate food instead.")

    else:  # food
        # Look up weightKg to store in Donation record
        food_res = supabase_admin.table("Food") \
            .select("weightKg") \
            .eq("foodID", str(donation.foodID)) \
            .single().execute()
        if not food_res.data:
            raise HTTPException(status_code=404, detail="Food item not found")
        food_kg = food_res.data["weightKg"] * donation.quantity

        if donation.purchaseID:
            # New buyer-owned food flow
            response = charity_post_service.donate_purchased_food(
                post_id, str(donation.purchaseID), str(donation.foodID), donation.quantity
            )
        else:
            # Legacy seller-stock flow (kept for backward compatibility during transition)
            response = charity_post_service.donate_food(
                post_id, str(donation.foodID), donation.quantity
            )

        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to process food donation")
        
        # Record the donation and get the donationID
        record_res = charity_post_service.record_donation(
            post_id, user_id, 'food',
            food_id=str(donation.foodID), quantity=donation.quantity, food_kg=food_kg
        )
        
        if record_res.data:
            donation_id = record_res.data[0]["donationID"]
            social_impact_service.create_food_donation_impact(
                donation_id=donation_id,
                rescued_kg=food_kg
            )

    # Notify charity
    try:
        post_data = response.data[0]
        notification_service.send_notification(
            user_id=post_data["userID"],
            title="New Donation Received 🎉",
            message=f"Someone donated to your post \"{post_data['title']}\".",
            type="donation",
            link="/charity/dashboard"
        )
    except Exception:
        logger.warning("Donation notification failed", exc_info=True)

    return {
        "post": response.data[0],
        "donationID": donation_id
    }

@router.post("/{charity_id}/donate-direct", response_model=CharityDonationResult)
async def donate_direct_to_post(
    charity_id: UUID,
    donation: DirectFoodDonationCreate,
    current_user: dict = Depends(get_current_user),  # any logged-in user, no buyer role needed
):
    """Direct food donation — donor describes food without needing a prior purchase."""
    post_id = str(charity_id)
    user_id = current_user["userID"]

    response = charity_post_service.donate_direct_food(
        post_id, donation.foodName, donation.foodPicture, donation.expiryDate.isoformat(),
        donation.weightKg, donation.quantity
    )

    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to process donation")

    post_data = response.data[0]["post"]
    kg_added = response.data[0]["kg_added"]

    # Record in Donation table
    record_res = charity_post_service.record_donation(
        post_id, user_id, "food_direct",
        food_kg=float(kg_added)
    )
    donation_id = record_res.data[0]["donationID"] if record_res.data else None

    if donation_id:
        social_impact_service.create_food_donation_impact(
            donation_id=donation_id,
            rescued_kg=float(kg_added)
        )

    try:
        notification_service.send_notification(
            user_id=post_data["userID"],
            title="New Food Donation Received 🎉",
            message=f"Someone donated food to your post \"{post_data['title']}\".",
            type="donation",
            link="/charity/dashboard"
        )
    except Exception:
        logger.warning("Donation notification failed", exc_info=True)

    return {"post": post_data, "donationID": donation_id}

@router.get("/donations/my-donations", response_model=List[DonationResponse])
async def get_my_donations(
    current_user: dict = Depends(get_current_user)
):
    """Auth required endpoint to get the current user's donation history."""
    response = charity_post_service.fetch_donations_by_user(current_user["userID"])
    
    # Map joined data to model fields
    donations = []
    for d in response.data:
        d["postTitle"] = d.get("CharityPost", {}).get("title")
        donations.append(d)
        
    return donations

@router.get("/{charity_id}/donations", response_model=List[DonationResponse])
async def get_post_donations(
    charity_id: UUID,
    current_user: dict = Depends(require_role("charity"))
):
    """Auth required (charity role) endpoint to get all donations for a post with ownership check."""
    # Ownership check
    post_response = charity_post_service.fetch_post_by_id(str(charity_id))
    if not post_response.data:
        raise HTTPException(status_code=404, detail="Charity post not found")
    
    if post_response.data["userID"] != current_user["userID"]:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this post")
    
    response = charity_post_service.fetch_donations_by_post(str(charity_id))
    
    # Map joined data to model fields
    donations = []
    for d in response.data:
        user = d.get("User")
        if user:
            d["donorName"] = f"{user.get('firstName', '')} {user.get('lastName', '')}".strip()
        
        # Check if rated (Rating might be a list or a dict depending on PostgREST version/syntax used in select)
        rating_data = d.get("Rating")
        if isinstance(rating_data, list):
            d["isRated"] = len(rating_data) > 0
        elif isinstance(rating_data, dict):
            d["isRated"] = rating_data.get("ratingID") is not None
        else:
            d["isRated"] = False
            
        donations.append(d)
        
    return donations

from models.rating import RatingResponse

@router.post("/{post_id}/donations/{donation_id}/rate", response_model=RatingResponse)
async def rate_donor(
    post_id: UUID,
    donation_id: UUID,
    data: CharityRateDonorRequest,
    current_user: dict = Depends(require_role("charity"))
):
    """Auth required (charity role) endpoint to rate a donor for a specific donation."""
    try:
        # We pass donationID in the data dict for create_rating
        rating_data = data.model_dump()
        rating_data["donationID"] = str(donation_id)
        # Note: create_rating already performs ownership checks on the post associated with the donationID
        return rating_service.create_rating(current_user["userID"], rating_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
