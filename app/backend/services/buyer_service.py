from database import supabase_admin
from uuid import UUID

def get_buyer_by_id(user_id: UUID):
    response = supabase_admin.table("Buyer").select("*").eq("userID", str(user_id)).execute()
    if not response.data:
        return None
    
    return response.data[0]