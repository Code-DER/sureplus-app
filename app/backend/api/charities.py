from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID

from database import supabase_admin
from models.charity import CharityResponse, CharityUpdate, CharityProfileResponse
from services import charity_service
from api.dependency import get_current_user, require_role

router = APIRouter()

def flatten_charity_profile(data: dict) -> dict:
    """Helper to flatten the joined User object into the Charity object."""
    if not data or "User" not in data:
        return data
    user_data = data.pop("User")
    return {**user_data, **data}

@router.get("/list", response_model=List[CharityResponse])
async def get_all_charities():
    """Public endpoint to list all charities."""
    response = charity_service.fetch_all_charities()
    return response.data

@router.get("/myprofile", response_model=CharityProfileResponse)
async def get_my_charity_profile(current_user: dict = Depends(get_current_user)):
    """Auth required endpoint to get the logged-in charity's profile."""
    user_id = current_user["userID"]
    response = charity_service.fetch_charity_profile(user_id)
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Charity profile not found")
    
    return flatten_charity_profile(response.data)

@router.get("/{user_id}", response_model=CharityProfileResponse)
async def get_charity_by_id(user_id: UUID):
    """Public endpoint to get a specific charity's profile."""
    response = charity_service.fetch_charity_profile(str(user_id))
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Charity not found")
    
    return flatten_charity_profile(response.data)

@router.put("/myprofile", response_model=CharityProfileResponse)
async def update_my_charity_profile(
    charity_update: CharityUpdate, 
    current_user: dict = Depends(require_role("charity"))
):
    """Auth required (charity role) endpoint to update the charity profile."""
    user_id = current_user["userID"]
    update_data = charity_update.model_dump(exclude_unset=True)
    
    # Fields belonging to Charity table
    charity_fields = ["organizationName"]
    charity_data = {k: v for k, v in update_data.items() if k in charity_fields}
    
    # Fields belonging to User table
    user_fields = ["firstName", "lastName", "phoneNumber", "street", "barangay", "city"]
    user_data = {k: v for k, v in update_data.items() if k in user_fields}

    # Perform updates
    if charity_data:
        charity_res = charity_service.update_charity(user_id, charity_data)
        if not charity_res.data:
            raise HTTPException(status_code=400, detail="Failed to update charity record")
            
    if user_data:
        user_res = supabase_admin.table("User").update(user_data).eq("userID", user_id).execute()
        if not user_res.data:
            raise HTTPException(status_code=400, detail="Failed to update user record")

    # Return the full updated profile
    final_res = charity_service.fetch_charity_profile(user_id)
    if not final_res.data:
         raise HTTPException(status_code=404, detail="Updated profile not found")
         
    return flatten_charity_profile(final_res.data)
