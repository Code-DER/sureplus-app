from fastapi import APIRouter, Depends, HTTPException
from models.user import BuyerRead
from api.dependency import get_current_user
from services.buyer_service import get_buyer_by_id 

router = APIRouter()

# Endpoint to fetch the profile of currently logged in user
@router.get("/me", response_model=BuyerRead)
async def get_my_buyer_profile(current_user: dict = Depends(get_current_user)):
    buyer = get_buyer_by_id(current_user["userID"])
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer profile not found.")

    return buyer