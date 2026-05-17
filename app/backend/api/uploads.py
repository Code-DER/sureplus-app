from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from typing import Dict
from database import supabase_admin, _require_env
import uuid
import os

router = APIRouter()

@router.post("/image", response_model=Dict[str, str])
async def upload_image(file: UploadFile = File(...)):
    """Uploads an image file to Supabase storage and returns the public URL."""
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File provided is not an image.")

        # Generate a unique filename
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"

        # Read file contents
        file_bytes = await file.read()

        # Upload to Supabase Storage bucket 'charity_images'
        supabase_admin.storage.from_("charity_images").upload(
            file=file_bytes,
            path=unique_filename,
            file_options={"content-type": file.content_type}
        )

        # Retrieve public URL
        public_url = supabase_admin.storage.from_("charity_images").get_public_url(unique_filename)
        
        return {"imageUrl": public_url}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")
