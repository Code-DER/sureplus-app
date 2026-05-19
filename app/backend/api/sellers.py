from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from database import supabase_admin
from models.user import SellerRead, SellerUpdate
from api.dependency import get_current_user
from services.seller_service import get_seller_by_id 

router = APIRouter()

# Endpoint to fetch the profile of currently logged in seller
@router.get("/me", response_model=SellerRead)
async def get_my_seller_profile(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'seller':
        raise HTTPException(status_code=403, detail="You do not have a seller profile.")
    
    seller = get_seller_by_id(current_user["userID"])
    if not seller:
        raise HTTPException(status_code=404, detail="Seller profile not found.")

    return seller

# Endpoint to fetch a seller's public profile by their ID
@router.get("/{seller_id}", response_model=SellerRead)
async def get_seller_public_profile(seller_id: UUID):
    seller = get_seller_by_id(seller_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found.")
    
    return seller

# Endpoint for sellers to update their seller profile
@router.patch("/update")
async def update_seller_profile(update_data: SellerUpdate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'seller':
        raise HTTPException(status_code=403, detail="You do not have a seller profile.")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}

    response = supabase_admin.table("Seller").update(update_dict).eq("userID", current_user["userID"]).execute()

    return {"message": "Seller profile updated successfully!", "Data": response.data}