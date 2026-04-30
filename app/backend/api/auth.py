from fastapi import APIRouter, HTTPException, Depends
from models.user import UserResponse, UserSignUp, UserLogin, Token
from database import supabase
from services import auth_service
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
async def signup(user_in: UserSignUp):
    user_dict = user_in.model_dump()
    return auth_service.create_user(user_dict)

@router.post("/login", response_model=Token)
async def login(user_input: UserLogin):
    response = supabase.table("User").select("*").eq("emailAddress", user_input.emailAddress).execute()

    if not response.data:
        raise HTTPException(status_code=400, detail="Invalid email!")
    
    user = response.data[0]

    if not auth_service.verify_password(user_input.password, user['password']):
        raise HTTPException(status_code=400, detail="Invalid password!")
    
    access_token = auth_service.create_access_token(data={"sub": str(user['userID']), "role": user['role']})

    return {"access_token": access_token, "token_type": "bearer"}