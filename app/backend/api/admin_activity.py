from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from api.dependency import require_role
from models.admin_activity import AdminActivityResponse
from services import admin_activity_service

router = APIRouter()

# Endpoint to fetch admin activity logs
@router.get("/", response_model=List[AdminActivityResponse])
async def get_admin_activity_logs(
    actionType: Optional[str] = None,
    targetEntity: Optional[str] = None,
    userID: Optional[str] = None,
    targetID: Optional[str] = None,
    limit: int = Query(default=100, ge=1, le=500),
    current_user: dict = Depends(require_role("admin")),
):
    response = admin_activity_service.fetch_admin_activities(
        action_type=actionType,
        target_entity=targetEntity,
        admin_id=userID,
        target_id=targetID,
        limit=limit,
    )
    return response.data
