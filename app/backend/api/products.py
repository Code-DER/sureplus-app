from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from api.dependency import get_current_user
from models.product import FoodCreate, FoodResponse, FoodUpdate
from services import product_service

router = APIRouter()


def require_seller(current_user: dict) -> str:
    if current_user["role"] != "seller":
        raise HTTPException(status_code=403, detail="Seller access is required.")
    return current_user["userID"]


@router.get("/", response_model=List[FoodResponse])
async def list_foods(
    safe_for_me: bool = Query(False),
    edible_only: Optional[bool] = Query(None),
    include_expired: bool = Query(True),
    seller_id: Optional[UUID] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    return product_service.list_foods(
        user_id=current_user["userID"],
        safe_for_user=safe_for_me,
        edible_only=edible_only,
        include_expired=include_expired,
        seller_id=str(seller_id) if seller_id else None,
    )


@router.post("/", response_model=FoodResponse)
async def create_food(food_input: FoodCreate, current_user: dict = Depends(get_current_user)):
    seller_id = require_seller(current_user)
    return product_service.create_food(seller_id, food_input.model_dump(mode="json"))


@router.get("/{food_id}", response_model=FoodResponse)
async def get_food(food_id: UUID, current_user: dict = Depends(get_current_user)):
    return product_service.get_food(str(food_id), user_id=current_user["userID"])


@router.patch("/{food_id}", response_model=FoodResponse)
async def update_food(
    food_id: UUID,
    food_input: FoodUpdate,
    current_user: dict = Depends(get_current_user),
):
    seller_id = require_seller(current_user)
    return product_service.update_food(
        seller_id,
        str(food_id),
        food_input.model_dump(exclude_unset=True, mode="json"),
    )


@router.delete("/{food_id}")
async def delete_food(food_id: UUID, current_user: dict = Depends(get_current_user)):
    seller_id = require_seller(current_user)
    product_service.delete_food(seller_id, str(food_id))
    return {"message": "Food listing deleted."}
