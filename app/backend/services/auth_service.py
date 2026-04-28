from passlib.context import CryptContext
from database import supabase
from fastapi import HTTPException

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

    # Insert user into the database
    response = supabase.table("User").insert(user_data).execute()
    return response.data[0]