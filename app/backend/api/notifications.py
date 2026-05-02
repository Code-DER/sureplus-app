from fastapi import APIRouter, Depends, HTTPException
from api.dependency import get_current_user
from database import supabase
from uuid import UUID

router = APIRouter()

@router.post("/list")
async def get_my_notifications(current_user: dict = Depends(get_current_user)):
    response = supabase.table("Notifications").select("*").eq("userID", current_user["userID"]).order("createdAt", desc=True).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="No notifications found!")
    
    return response.data

@router.patch("/{notification_id}/read")
async def mark_notification_as_read(notification_id: UUID, current_user: dict = Depends(get_current_user)):

    response = supabase.table("Notifications").update({"isRead": True}).eq("notificationID", notification_id).eq("userID", current_user["userID"]).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Notification not found!")
    
    return {"message": "Notification is read!"}

@router.patch("/read-all")
async def mark_all_notifications_as_read(current_user: dict = Depends(get_current_user)):
    response = supabase.table("Notifications").update({"isRead": True}).eq("userID", current_user["userID"]).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="No notifications foound!")
    
    return {"message": "All notifications are read!"}
