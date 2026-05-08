from database import supabase_admin
from uuid import UUID

def get_seller_by_id(user_id: UUID):
    response = supabase_admin.table("Seller").select("*").eq("userID", str(user_id)).execute()
    if not response.data:
        return None
    
    return response.data[0]