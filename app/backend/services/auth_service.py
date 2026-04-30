from passlib.context import CryptContext
from database import supabase
from fastapi import HTTPException
import jwt
import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    clean_password = str(password)
    if len(clean_password.encode('utf-8')) > 72:
        raise HTTPException(status_code=400, detail="Password too long!")
    return pwd_context.hash(clean_password)

def create_user(user_data: dict):
    # Check if email exists
    existing = supabase.table("User").select("emailAddress").eq("emailAddress", user_data["emailAddress"]).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered!")
    
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

    # Create an entry on the Buyer Table if the user is a buyer
    if new_user.get('role') == 'buyer':
        buyer_data = {
            "userID": new_user_id,
            "points": 0
        }
        buyer_response = supabase.table("Buyer").insert(buyer_data).execute()

        if not buyer_response.data:
            raise HTTPException(status_code=500, detail="Failed to create buyer!")

    return new_user

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()

    secret_key = os.getenv("SUPABASE_ANON_KEY")

    algorithm = os.getenv("ALGORITHM", "HS256")

    expire_time = int(os.getenv("ACCESS_TOKEN_EXPIRE_TIME_MINUTES", "30"))

    if not secret_key:
        raise ValueError("Secret Key is missing from .env")
    
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_time)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt