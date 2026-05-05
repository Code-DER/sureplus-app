from fastapi import APIRouter
from models.rating import RatingCreate
from services.rating_service import create_rating, get_seller_rating_list

router = APIRouter()

@router.post("/rating")
def rate(data: RatingCreate):
    return create_rating(data.model_dump())

@router.post("/rating/seller/{seller_id}")
def seller_ratings(seller_id: str):
    return get_seller_rating_list(seller_id)