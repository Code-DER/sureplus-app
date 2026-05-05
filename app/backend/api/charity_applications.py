from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID
from api.dependency import get_current_user, require_role
from models.charity_application import CharityApplicationCreate, CharityApplicationResponse, CharityApplicationReview
from services import charity_application_service

router = APIRouter()

@router.post("/", response_model=CharityApplicationResponse)
async def create_application(application: CharityApplicationCreate, current_user: dict = Depends(get_current_user)):
    try:
        response = charity_application_service.submit_application(
            user_id=current_user["userID"],
            data=application.model_dump()
        )
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/mine", response_model=List[CharityApplicationResponse])
async def get_my_applications(current_user: dict = Depends(get_current_user)):
    response = charity_application_service.fetch_application_by_user(current_user["userID"])
    return response.data

@router.get("/pending", response_model=List[CharityApplicationResponse])
async def get_pending_applications(current_user: dict = Depends(require_role("admin"))):
    response = charity_application_service.fetch_all_pending()
    return response.data

@router.put("/{application_id}/review")
async def review_application(
    application_id: UUID, 
    review: CharityApplicationReview, 
    current_user: dict = Depends(require_role("admin"))
):
    try:
        response = charity_application_service.review_application(
            application_id=str(application_id),
            status=review.status,
            org_name=review.organizationName
        )
        return {"message": f"Application {review.status} successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
