from fastapi import APIRouter
from services import user_service
from models.user import UserResponse
from typing import List

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
async def get_users():
    response = user_service.fetch_all_users()
    return response.data