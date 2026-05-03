from database import supabase
from uuid import UUID

# Function to send a notification to a user
def send_notification(user_id: UUID, title: str, message: str, type: str = "system", link: str = None):
    # Notification data
    notification_data = {
        "userID": user_id,
        "title": title,
        "message": message,
        "type": type,
        "link": link,
        "isRead": False
    }

    # Insert the notification info into the Table
    response = supabase.table("Notifications").insert(notification_data).execute()

    # Raise an error if notification could not be sent
    if not response.data:
        raise Exception("Failed to send notification!")
    
    # return the notification response
    return response