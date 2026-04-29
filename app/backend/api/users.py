from fastapi import APIRouter, HTTPException
from services import user_service
from models.user import UserResponse
from typing import List
from uuid import UUID

router = APIRouter()

# Endpoint to fetch all users and their details
@router.get("", response_model=List[UserResponse])
async def get_users():
    response = user_service.fetch_all_users()
    return response.data

# Endpoint to fetch a user by their ID
@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: UUID):
    try:
        response = user_service.fetch_user_by_id(str(user_id))

        if not response.data:
            raise HTTPException(status_code=404, detail="User not found!")
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail="User not found!")