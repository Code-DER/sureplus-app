from fastapi import APIRouter
from models.user import UserResponse, UserSignUp
from services import auth_service

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
async def signup(user_in: UserSignUp):
    user_dict = user_in.model_dump()
    return auth_service.create_user(user_dict)