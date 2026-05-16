from fastapi import APIRouter, HTTPException, Depends
from uuid import UUID
from typing import List

from models.social_impact import SocialImpactResponse, SocialImpactSummary, GlobalImpactResponse
from services import social_impact_service, purchase_service, charity_post_service
from api.dependency import get_current_user

router = APIRouter()

@router.get("/global", response_model=GlobalImpactResponse)
async def get_global_impact():
    """
    Fetch historical timeline of impact events for the current user.
    """
    return social_impact_service.fetch_global_impact()

@router.get("/purchase/{purchase_id}", response_model=SocialImpactResponse)
async def get_impact_by_purchase(
    purchase_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    Fetch social impact for a specific purchase.
    Ownership check: only the buyer of the purchase can see its impact.
    """
    # Ownership check via service layer (L-5)
    owner_id = purchase_service.fetch_purchase_owner(str(purchase_id))
    
    if not owner_id:
        raise HTTPException(status_code=404, detail="Purchase not found")
    
    if owner_id != current_user["userID"]:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this purchase")
    
    impact_response = social_impact_service.fetch_impact_by_purchase(str(purchase_id))
    if not impact_response.data:
        raise HTTPException(status_code=404, detail="Social impact record not found for this purchase")
    
    return impact_response.data

@router.get("/donation/{donation_id}", response_model=SocialImpactResponse)
async def get_impact_by_donation(
    donation_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    Fetch social impact for a specific donation.
    Ownership check: only the donor can see its impact.
    """
    owner_id = charity_post_service.fetch_donation_owner(str(donation_id))
    
    if not owner_id:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    if owner_id != current_user["userID"]:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this donation")
    
    impact_response = social_impact_service.fetch_impact_by_donation(str(donation_id))
    if not impact_response.data:
        raise HTTPException(status_code=404, detail="Social impact record not found for this donation")
    
    return impact_response.data

@router.get("/summary", response_model=SocialImpactSummary)
async def get_my_impact_summary(
    current_user: dict = Depends(get_current_user)
):
    """
    Fetch aggregated social impact summary for the current user.
    """
    summary = social_impact_service.fetch_summary_by_user(current_user["userID"])
    return summary

@router.get("/history")
async def get_my_impact_history(
    current_user: dict = Depends(get_current_user)
):
    """
    Fetch historical timeline of impact events for the current user.
    """
    return social_impact_service.fetch_impact_history(current_user["userID"])
