from fastapi import APIRouter, Depends, HTTPException
from api.dependency import get_current_user
from database import supabase
from uuid import UUID

router = APIRouter()

# Endpoint to fetch the notifications of the logged in user
@router.post("/list")
async def get_my_notifications(current_user: dict = Depends(get_current_user)):
    # Fetch notifications for the current user ordered by createdAt
    response = supabase.table("Notifications").select("*").eq("userID", current_user["userID"]).order("createdAt", desc=True).execute()

    # Raise an error if no notifications are found for the user
    if not response.data:
        raise HTTPException(status_code=404, detail="No notifications found!")
    
    # return the notifications data
    return response.data

# Endpoint to mark a notification as read
@router.patch("/{notification_id}/read")
async def mark_notification_as_read(notification_id: UUID, current_user: dict = Depends(get_current_user)):
    # Update the notification's isRead to True for the notification ID and userID
    response = supabase.table("Notifications").update({"isRead": True}).eq("notificationID", notification_id).eq("userID", current_user["userID"]).execute()

    # Raise an error if the notification is not found for the user
    if not response.data:
        raise HTTPException(status_code=404, detail="Notification not found!")
    
    # returns success message
    return {"message": "Notification is read!"}

# Endpoint to mark all notifications as read
@router.patch("/read-all")
async def mark_all_notifications_as_read(current_user: dict = Depends(get_current_user)):
    # Update all notifications' isRead to True for the user
    response = supabase.table("Notifications").update({"isRead": True}).eq("userID", current_user["userID"]).execute()

    # Raise an error if no notifications are found for the user
    if not response.data:
        raise HTTPException(status_code=404, detail="No notifications foound!")
    
    # returns success message
    return {"message": "All notifications are read!"}
