from passlib.context import CryptContext
from database import supabase_admin
from fastapi import HTTPException
import jwt
import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

# Context for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Function to load the backend-only JWT secret
def get_jwt_secret():
    secret_key = os.getenv("JWT_SECRET_KEY")

    if not secret_key:
        raise ValueError("JWT_SECRET_KEY is missing from .env")

    return secret_key

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
    existing = supabase_admin.table("User").select("emailAddress").eq("emailAddress", user_data["emailAddress"]).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered!")
    
    # Hash password
    user_data['password'] = hash_password(user_data['password'])

    # Insert user into User Table
    user_response = supabase_admin.table("User").insert(user_data).execute()

    # Check if user creation was successful
    if not user_response.data:
        raise HTTPException(status_code=500, detail="Failed to create user!")

    # Get the new user's ID
    new_user = user_response.data[0]
    new_user_id = new_user['userID']

    # Create an entry on the role extension table for the new user.
    if new_user.get('role') == 'buyer':
        buyer_data = {
            "userID": new_user_id,
            "points": 0
        }
        buyer_response = supabase_admin.table("Buyer").insert(buyer_data).execute()

        if not buyer_response.data:
            raise HTTPException(status_code=500, detail="Failed to create buyer!")
    elif new_user.get('role') == 'seller':
        seller_response = supabase_admin.table("Seller").insert({"userID": new_user_id}).execute()

        if not seller_response.data:
            raise HTTPException(status_code=500, detail="Failed to create seller!")
    elif new_user.get('role') == 'charity':
        charity_response = supabase_admin.table("Charity").insert({"userID": new_user_id}).execute()

        if not charity_response.data:
            raise HTTPException(status_code=500, detail="Failed to create charity!")
    elif new_user.get('role') == 'admin':
        admin_response = supabase_admin.table("Admin").insert({"userID": new_user_id}).execute()

        if not admin_response.data:
            raise HTTPException(status_code=500, detail="Failed to create admin!")

    return new_user

# Function to fetch a user by email during login
def fetch_user_by_email(email_address: str):
    return supabase_admin.table("User").select("*").eq("emailAddress", email_address).execute()

# Function to fetch the current authorization context from the database
def fetch_user_auth_context(user_id: str):
    response = (
        supabase_admin.table("User")
        .select("userID, role")
        .eq("userID", user_id)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]

# Function to verify the password
def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# Function to create a JWT access token
def create_access_token(data: dict):
    # Create a copy of the data to encode
    to_encode = data.copy()

    # Get the keys, algorithm, and expiry time from the env
    secret_key = get_jwt_secret()
    algorithm = os.getenv("ALGORITHM", "HS256")
    expire_time = int(os.getenv("ACCESS_TOKEN_EXPIRE_TIME_MINUTES", "30"))
    
    # Calcualte the expiry time 
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_time)
    to_encode.update({"exp": expire})

    # Encode the final JWT token
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    
    # Return the token
    return encoded_jwt
