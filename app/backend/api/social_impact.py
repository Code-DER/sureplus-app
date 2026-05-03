from fastapi import APIRouter, HTTPException, Depends
from uuid import UUID
from typing import List

from models.social_impact import SocialImpactResponse, SocialImpactSummary
from services import social_impact_service
from api.dependency import get_current_user
from database import supabase

router = APIRouter()

@router.get("/purchase/{purchase_id}", response_model=SocialImpactResponse)
async def get_impact_by_purchase(
    purchase_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    Fetch social impact for a specific purchase.
    Ownership check: only the buyer of the purchase can see its impact.
    """
    # Ownership check
    purchase_response = supabase.table("Purchase") \
        .select("userID") \
        .eq("purchaseID", str(purchase_id)) \
        .single() \
        .execute()
    
    if not purchase_response.data:
        raise HTTPException(status_code=404, detail="Purchase not found")
    
    if purchase_response.data["userID"] != current_user["userID"]:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this purchase")
    
    impact_response = social_impact_service.fetch_impact_by_purchase(str(purchase_id))
    if not impact_response.data:
        raise HTTPException(status_code=404, detail="Social impact record not found for this purchase")
    
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
