from fastapi import APIRouter, Depends, HTTPException
from models.rating import RatingCreate, RatingResponse
from services.rating_service import create_rating, get_seller_rating_list
from api.dependency import get_current_user

router = APIRouter()

@router.post("/", response_model=RatingResponse)
def rate(data: RatingCreate, current_user: dict = Depends(get_current_user)):
    try:
        return create_rating(current_user["userID"], data.model_dump())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/seller/{seller_id}")
def seller_ratings(seller_id: str):
    return get_seller_rating_list(seller_id)