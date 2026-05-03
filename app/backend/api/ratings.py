from fastapi import APIRouter
from models.rating import RatingCreate
from services.rating_service import create_rating

router = APIRouter()

@router.post("/rating")
def rate(data: RatingCreate):
    return create_rating(data.model_dump())