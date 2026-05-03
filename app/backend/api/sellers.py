from fastapi import APIRouter, HTTPException, Depends
from uuid import UUID
from api.dependency import get_current_user
from models.user import SellerSignUp
from services.user_service import create_seller_profile
from database import supabase

router = APIRouter()

