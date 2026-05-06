from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from models.user import SellerRead
from api.dependency import get_current_user
from services.seller_service import get_seller_by_id 

router = APIRouter()

@router.get("/me", response_model=SellerRead)
async def get_my_seller_profile(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'seller':
        raise HTTPException(status_code=403, detail="You do not have a seller profile.")
    
    seller = get_seller_by_id(current_user["userID"])
    if not seller:
        raise HTTPException(status_code=404, detail="Seller profile not found.")

    return seller

@router.get("/{seller_id}", response_model=SellerRead)
async def get_seller_public_profile(seller_id: UUID):
    seller = get_seller_by_id(seller_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found.")
    
    return seller