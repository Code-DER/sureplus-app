import uuid as _uuid
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from api.dependency import get_current_user
from models.product import FoodCreate, FoodResponse, FoodUpdate
from services import product_service
from database import supabase_admin

router = APIRouter()

# Constants for image validation and storage
_ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
_ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
_MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB
_IMAGE_BUCKET = "food_images"

# Helper function to enforce seller role for certain endpoints
def require_seller(current_user: dict) -> str:
    if current_user["role"] != "seller":
        raise HTTPException(status_code=403, detail="Seller access is required.")
    return current_user["userID"]

# Temporary endpoint to debug storage access - lists buckets visible to the admin client
@router.get("/debug-storage")
async def debug_storage(current_user: dict = Depends(get_current_user)):
    """Temporary: lists buckets visible to the admin client."""
    try:
        buckets = supabase_admin.storage.list_buckets()
        return {"url": str(supabase_admin.supabase_url), "buckets": [b.name for b in buckets]}
    except Exception as exc:
        return {"error": str(exc)}

# Endpoint to upload food images, restricted to sellers, with validation for file type and size
@router.post("/upload-image")
async def upload_food_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    require_seller(current_user)

    # Validate MIME type reported by the client
    content_type = (file.content_type or "").lower()
    if content_type not in _ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, or WebP images are allowed.",
        )

    # Validate extension as a secondary check
    ext = ""
    if file.filename and "." in file.filename:
        ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in _ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="File extension must be .jpg, .jpeg, .png, or .webp.",
        )

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    if len(contents) > _MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Image exceeds the 5 MB size limit ({len(contents) // 1024} KB uploaded).",
        )

    filename = f"{_uuid.uuid4()}.{ext}"

    try:
        supabase_admin.storage.from_(_IMAGE_BUCKET).upload(
            filename,
            contents,
            {"content-type": content_type, "upsert": "false"},
        )
        public_url = supabase_admin.storage.from_(_IMAGE_BUCKET).get_public_url(filename)
        return {"url": public_url}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {exc}") from exc

# Endpoint for buyers to browse available food listings
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

# Endpoint for sellers to create a new food listing
@router.post("/", response_model=FoodResponse)
async def create_food(food_input: FoodCreate, current_user: dict = Depends(get_current_user)):
    seller_id = require_seller(current_user)
    return product_service.create_food(seller_id, food_input.model_dump(mode="json"))

# Endpoint for buyers to view details of a specific food listing
@router.get("/{food_id}", response_model=FoodResponse)
async def get_food(food_id: UUID, current_user: dict = Depends(get_current_user)):
    return product_service.get_food(str(food_id), user_id=current_user["userID"])

# Endpoint for sellers to update their food listing, with partial updates allowed
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

# Endpoint for sellers to delete their food listing
@router.delete("/{food_id}")
async def delete_food(food_id: UUID, current_user: dict = Depends(get_current_user)):
    seller_id = require_seller(current_user)
    product_service.delete_food(seller_id, str(food_id))
    return {"message": "Food listing deleted."}
