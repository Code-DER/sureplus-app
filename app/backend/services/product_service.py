import logging
from datetime import date
from typing import Dict, Iterable, List, Optional, Set

from fastapi import HTTPException

from database import supabase_admin


logger = logging.getLogger(__name__)

FOOD_COLUMNS = (
    "foodID, userID, foodName, description, picture, isEdible, "
    "price, stockQuantity, expirationDate, createdAt"
)
ALLERGEN_COLUMNS = "allergenID, name"


def _execute(query, error_detail: str):
    try:
        return query.execute()
    except Exception as exc:
        logger.exception(error_detail)
        raise HTTPException(status_code=500, detail=error_detail) from exc


def _dedupe(values: Iterable) -> List[str]:
    seen: Set[str] = set()
    deduped: List[str] = []
    for value in values:
        value_str = str(value)
        if value_str not in seen:
            seen.add(value_str)
            deduped.append(value_str)
    return deduped


def _fetch_allergen_map(allergen_ids: Iterable) -> Dict[str, dict]:
    ids = _dedupe(allergen_ids)
    if not ids:
        return {}

    response = _execute(
        supabase_admin.table("Allergen").select(ALLERGEN_COLUMNS).in_("allergenID", ids),
        "Failed to fetch allergens",
    )
    return {str(row["allergenID"]): row for row in response.data or []}


def _validate_allergen_ids(allergen_ids: Iterable) -> List[str]:
    ids = _dedupe(allergen_ids)
    allergen_map = _fetch_allergen_map(ids)
    missing_ids = [allergen_id for allergen_id in ids if allergen_id not in allergen_map]

    if missing_ids:
        raise HTTPException(
            status_code=404,
            detail={"message": "Some allergens were not found.", "allergenIDs": missing_ids},
        )

    return ids


def _fetch_food_allergen_rows(food_ids: Iterable) -> List[dict]:
    ids = _dedupe(food_ids)
    if not ids:
        return []

    response = _execute(
        supabase_admin.table("FoodAllergen").select("foodID, allergenID").in_("foodID", ids),
        "Failed to fetch food allergens",
    )
    return response.data or []


def _fetch_user_allergen_ids(user_id: str) -> Set[str]:
    response = _execute(
        supabase_admin.table("UserAllergies").select("allergenID").eq("userID", user_id),
        "Failed to fetch user allergies",
    )
    return {str(row["allergenID"]) for row in response.data or []}


def _attach_allergens(food_rows: List[dict], user_id: Optional[str] = None) -> List[dict]:
    food_ids = [row["foodID"] for row in food_rows]
    relation_rows = _fetch_food_allergen_rows(food_ids)
    allergen_map = _fetch_allergen_map(row["allergenID"] for row in relation_rows)
    user_allergen_ids = _fetch_user_allergen_ids(user_id) if user_id else set()

    relations_by_food: Dict[str, List[dict]] = {}
    for row in relation_rows:
        relations_by_food.setdefault(str(row["foodID"]), []).append(row)

    enriched_food = []
    for food in food_rows:
        food_id = str(food["foodID"])
        relations = relations_by_food.get(food_id, [])
        allergen_ids = [str(row["allergenID"]) for row in relations]
        matched_ids = sorted(set(allergen_ids).intersection(user_allergen_ids))

        enriched = dict(food)
        enriched["allergens"] = [
            allergen_map[allergen_id]
            for allergen_id in allergen_ids
            if allergen_id in allergen_map
        ]
        enriched["matchedAllergenIDs"] = matched_ids
        enriched["isSafeForCurrentUser"] = len(matched_ids) == 0 if user_id else None
        enriched_food.append(enriched)

    return enriched_food


def list_foods(
    user_id: Optional[str] = None,
    safe_for_user: bool = False,
    edible_only: Optional[bool] = None,
    include_expired: bool = True,
    seller_id: Optional[str] = None,
) -> List[dict]:
    query = supabase_admin.table("Food").select(FOOD_COLUMNS)

    if edible_only is not None:
        query = query.eq("isEdible", edible_only)
    if seller_id:
        query = query.eq("userID", seller_id)
    if not include_expired:
        query = query.gte("expirationDate", date.today().isoformat())

    response = _execute(query.order("createdAt", desc=True), "Failed to fetch food listings")
    foods = _attach_allergens(response.data or [], user_id=user_id)

    if safe_for_user and user_id:
        foods = [food for food in foods if food["isSafeForCurrentUser"]]

    return foods


def get_food(food_id: str, user_id: Optional[str] = None) -> dict:
    response = _execute(
        supabase_admin.table("Food").select(FOOD_COLUMNS).eq("foodID", food_id).limit(1),
        "Failed to fetch food listing",
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Food listing not found.")

    return _attach_allergens([response.data[0]], user_id=user_id)[0]


def create_food(seller_id: str, food_data: dict) -> dict:
    allergen_ids = _validate_allergen_ids(food_data.pop("allergenIDs", []))
    food_data["userID"] = seller_id

    response = _execute(
        supabase_admin.table("Food").insert(food_data),
        "Failed to create food listing",
    )

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create food listing.")

    food = response.data[0]
    if allergen_ids:
        rows = [
            {"foodID": food["foodID"], "allergenID": allergen_id}
            for allergen_id in allergen_ids
        ]
        _execute(
            supabase_admin.table("FoodAllergen").insert(rows),
            "Failed to attach food allergens",
        )

    return get_food(food["foodID"], user_id=seller_id)


def update_food(seller_id: str, food_id: str, food_data: dict) -> dict:
    existing_food = get_food(food_id)
    if str(existing_food["userID"]) != str(seller_id):
        raise HTTPException(status_code=403, detail="You can only update your own food listings.")

    allergen_ids = food_data.pop("allergenIDs", None)
    update_data = {key: value for key, value in food_data.items() if value is not None}

    if not update_data and allergen_ids is None:
        raise HTTPException(status_code=400, detail="No food listing changes were provided.")

    if update_data:
        response = _execute(
            supabase_admin.table("Food").update(update_data).eq("foodID", food_id),
            "Failed to update food listing",
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="Food listing not found.")

    if allergen_ids is not None:
        validated_allergen_ids = _validate_allergen_ids(allergen_ids)
        _execute(
            supabase_admin.table("FoodAllergen").delete().eq("foodID", food_id),
            "Failed to replace food allergens",
        )
        if validated_allergen_ids:
            rows = [
                {"foodID": food_id, "allergenID": allergen_id}
                for allergen_id in validated_allergen_ids
            ]
            _execute(
                supabase_admin.table("FoodAllergen").insert(rows),
                "Failed to attach food allergens",
            )

    return get_food(food_id, user_id=seller_id)


def delete_food(seller_id: str, food_id: str) -> None:
    existing_food = get_food(food_id)
    if str(existing_food["userID"]) != str(seller_id):
        raise HTTPException(status_code=403, detail="You can only delete your own food listings.")

    _execute(
        supabase_admin.table("Food").delete().eq("foodID", food_id),
        "Failed to delete food listing",
    )


def list_allergens() -> List[dict]:
    response = _execute(
        supabase_admin.table("Allergen").select(ALLERGEN_COLUMNS).order("name"),
        "Failed to fetch allergens",
    )
    return response.data or []


def create_allergen(allergen_data: dict) -> dict:
    response = _execute(
        supabase_admin.table("Allergen").insert(allergen_data),
        "Failed to create allergen",
    )

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create allergen.")

    return response.data[0]


def get_user_allergies(user_id: str) -> dict:
    allergy_rows = _execute(
        supabase_admin.table("UserAllergies").select("allergenID").eq("userID", user_id),
        "Failed to fetch user allergies",
    ).data or []
    allergen_map = _fetch_allergen_map(row["allergenID"] for row in allergy_rows)

    return {
        "userID": user_id,
        "allergens": list(allergen_map.values()),
    }


def replace_user_allergies(user_id: str, allergen_ids: Iterable) -> dict:
    ids = _validate_allergen_ids(allergen_ids)

    _execute(
        supabase_admin.table("UserAllergies").delete().eq("userID", user_id),
        "Failed to replace user allergies",
    )

    if ids:
        rows = [{"userID": user_id, "allergenID": allergen_id} for allergen_id in ids]
        _execute(
            supabase_admin.table("UserAllergies").insert(rows),
            "Failed to save user allergies",
        )

    return get_user_allergies(user_id)


def add_user_allergy(user_id: str, allergen_id: str) -> dict:
    _validate_allergen_ids([allergen_id])
    existing_ids = _fetch_user_allergen_ids(user_id)

    if allergen_id not in existing_ids:
        _execute(
            supabase_admin.table("UserAllergies").insert(
                {"userID": user_id, "allergenID": allergen_id}
            ),
            "Failed to save user allergy",
        )

    return get_user_allergies(user_id)


def remove_user_allergy(user_id: str, allergen_id: str) -> dict:
    _execute(
        supabase_admin.table("UserAllergies")
        .delete()
        .eq("userID", user_id)
        .eq("allergenID", allergen_id),
        "Failed to remove user allergy",
    )
    return get_user_allergies(user_id)
