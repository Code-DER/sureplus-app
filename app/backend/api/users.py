from fastapi import APIRouter, HTTPException, Depends
from database import supabase_admin
from typing import List
from uuid import UUID
from services import user_service
from models.user import UserResponse, SellerSignUp, UserUpdate, PasswordChange
from api.dependency import get_current_user
from services.user_service import create_seller_profile
from services.auth_service import verify_password, hash_password

router = APIRouter()

# Endpoint to fetch all users and their details
@router.get("/list", response_model=List[UserResponse])
async def get_users(current_user: dict = Depends(get_current_user)):
    # Fetch all users from the database using the user service
    response = user_service.fetch_all_users()

    # Return the list of users
    return response.data

# Endpoint to fetch the profile of currently logged in user
@router.get("/myprofile")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    # Get the userID from the current user's token
    user_id = current_user["userID"]

    # Fetch the user's profile from the database
    user = supabase_admin.table("User")\
        .select("userID, firstName, lastName, role, emailAddress, phoneNumber, street, residentialName, barangay, city")\
        .eq("userID", user_id)\
        .execute()
    
    # Raise an error if user is not found
    if not user.data:
        raise HTTPException(status_code=404, detail="User not found!")
    
    # Return the data of the logged in user
    return user.data[0]

# Endpoint to fetch a user by their ID
@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: UUID, current_user: dict = Depends(get_current_user)):
    # Get the user details from the database
    response = user_service.fetch_user_by_id(str(user_id))

    # Raise an error if user is not found
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found!")
    
    # Return the user details
    return response.data[0]
    
@router.post("/upgrade")
async def upgrade_to_seller(seller_input: SellerSignUp, current_user: dict = Depends(get_current_user)):
    existing = supabase_admin.table("Seller").select("userID").eq("userID", current_user["userID"]).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="User is already a seller!")
    
    create_seller_profile(
        user_id=current_user["userID"],
        company_name=seller_input.companyName,
        seller_type=seller_input.sellerType
    )

    supabase_admin.table("User").update({"role": "seller"}).eq("userID", current_user["userID"]).execute()

    return {"message": "Successfully upgraded to seller!"}

@router.patch("/update")
async def update_user_profile(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}

    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields provided for update!")
    
    response = supabase_admin.table("User").update(update_dict).eq("userID", current_user["userID"]).execute()

    return {"message": "User profile updated successfully!", "Data": response.data}

@router.post("/change-password")
async def change_password(data: PasswordChange, current_user: dict = Depends(get_current_user)):
    user_response = supabase_admin.table("User").select("*").eq("userID", current_user['userID']).execute()
    user_db = user_response.data[0]

    if not verify_password(data.currentPassword, user_db['password']):
        raise HTTPException(status_code=400, detail="Current password is incorrect!")

    new_hashed_password = hash_password(data.newPassword)
    supabase_admin.table("User").update({"password": new_hashed_password}).eq("userID", current_user["userID"]).execute()

    return {"message": "Password changed successfully!"}
