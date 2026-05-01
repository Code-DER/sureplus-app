from fastapi import APIRouter, HTTPException, Depends
from models.user import UserResponse, UserSignUp, UserLogin, Token
from database import supabase
from services import auth_service
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

# Endpoint for user signup
@router.post("/signup", response_model=UserResponse)
async def signup(user_input: UserSignUp):
    # Convert the model to a dictionary
    user_dict = user_input.model_dump()

    # Create the user using the auth service
    return auth_service.create_user(user_dict)

# Endpoint for user login
@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Check if the email exists in the database
    response = supabase.table("User").select("*").eq("emailAddress", form_data.username).execute()

    # If the email does not exist, raise an error
    if not response.data:
        raise HTTPException(status_code=400, detail="Invalid email!")
    
    # Get the user data from the response
    user = response.data[0]

    # Verify the password through the auth service
    if not auth_service.verify_password(form_data.password, user['password']):
        raise HTTPException(status_code=400, detail="Invalid password!")
    
    # Create a JWT access token for the logged in user
    access_token = auth_service.create_access_token(data={"sub": str(user['userID']), "role": user['role']})

    # Return the access token and its type
    return {"access_token": access_token, "token_type": "bearer"}