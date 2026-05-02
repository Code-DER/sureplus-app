from database import supabase
from uuid import UUID

def send_notification(user_id: UUID, title: str, message: str, type: str = "system", link: str = None):
    notification_data = {
        "userID": user_id,
        "title": title,
        "message": message,
        "type": type,
        "link": link,
        "isRead": False
    }

    response = supabase.table("Notifications").insert(notification_data).execute()

    if not response.data:
        raise Exception("Failed to send notification!")
    
    return response