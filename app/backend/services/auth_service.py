from passlib.context import CryptContext
from database import supabase
from fastapi import HTTPException
import jwt
import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from services.user_service import create_seller_profile
from services.notification_service import send_notification

load_dotenv()

# Context for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Function to hash the password
def hash_password(password: str):
    # Convert the password to a string
    clean_password = str(password)

    # Check the length of the password given bcrypt's limit
    if len(clean_password.encode('utf-8')) > 72:
        raise HTTPException(status_code=400, detail="Password too long!")
    
    # Hash and return the password
    return pwd_context.hash(clean_password)

# Function to create a new user
def create_user(user_data: dict):
    # Check if email exists
    existing = supabase.table("User").select("emailAddress").eq("emailAddress", user_data["emailAddress"]).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered!")
    
    become_seller = user_data.pop("becomeSeller", False)
    seller_info = user_data.pop("sellerInfo", None)

    # Set role based on user's choice
    user_data['role'] = "seller" if become_seller else "buyer"
    # Hash password
    user_data['password'] = hash_password(user_data['password'])

    # Insert user into User Table
    user_response = supabase.table("User").insert(user_data).execute()
    # Check if user creation was successful
    if not user_response.data:
        raise HTTPException(status_code=500, detail="Failed to create user!")

    # Get the new user's ID
    new_user = user_response.data[0]
    new_user_id = new_user['userID']

    buyer_data = {"userID": new_user_id, "points": 0}
    buyer_response = supabase.table("Buyer").insert(buyer_data).execute()
    if not buyer_response.data:
        raise HTTPException(status_code=500, detail="Failed to create buyer!")

    if become_seller and seller_info:
        company_name = seller_info.get('companyName')
        seller_type = seller_info.get('sellerType')

        create_seller_profile(new_user_id, company_name, seller_type)

    # Send welcome notification to the new user
    send_notification(
        user_id=new_user_id,
        title="Welcome to SurePlus!",
        message="Thank you for signing up. Start saving food today!",
    )

    return new_user

# Function to verify the password
def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# Function to create a JWT access token
def create_access_token(data: dict):
    # Create a copy of the data to encode
    to_encode = data.copy()

    # Get the keys, algorithm, and expiry time from the env
    secret_key = os.getenv("SUPABASE_ANON_KEY")
    algorithm = os.getenv("ALGORITHM", "HS256")
    expire_time = int(os.getenv("ACCESS_TOKEN_EXPIRE_TIME_MINUTES", "30"))

    # Raise an error if secret key is missing
    if not secret_key:
        raise ValueError("Secret Key is missing from .env")
    
    # Calcualte the expiry time 
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_time)
    to_encode.update({"exp": expire})

    # Encode the final JWT token
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    
    # Return the token
    return encoded_jwt