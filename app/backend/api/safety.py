from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from api.dependency import get_current_user
from models.product import AllergenCreate, AllergenResponse, UserAllergiesResponse, UserAllergiesUpdate
from services import product_service

router = APIRouter()


def require_admin(current_user: dict) -> None:
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access is required.")


@router.get("/allergens", response_model=List[AllergenResponse])
async def list_allergens():
    return product_service.list_allergens()


@router.post("/allergens", response_model=AllergenResponse)
async def create_allergen(
    allergen_input: AllergenCreate,
    current_user: dict = Depends(get_current_user),
):
    require_admin(current_user)
    return product_service.create_allergen(allergen_input.model_dump())


@router.get("/me/allergies", response_model=UserAllergiesResponse)
async def get_my_allergies(current_user: dict = Depends(get_current_user)):
    return product_service.get_user_allergies(current_user["userID"])


@router.put("/me/allergies", response_model=UserAllergiesResponse)
async def replace_my_allergies(
    allergy_input: UserAllergiesUpdate,
    current_user: dict = Depends(get_current_user),
):
    return product_service.replace_user_allergies(
        current_user["userID"],
        allergy_input.allergenIDs,
    )


@router.post("/me/allergies/{allergen_id}", response_model=UserAllergiesResponse)
async def add_my_allergy(allergen_id: UUID, current_user: dict = Depends(get_current_user)):
    return product_service.add_user_allergy(current_user["userID"], str(allergen_id))


@router.delete("/me/allergies/{allergen_id}", response_model=UserAllergiesResponse)
async def remove_my_allergy(allergen_id: UUID, current_user: dict = Depends(get_current_user)):
    return product_service.remove_user_allergy(current_user["userID"], str(allergen_id))
