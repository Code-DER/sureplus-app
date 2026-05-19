"""
    Service layer for handling seller-related operations.
"""
from database import supabase_admin
from uuid import UUID

# Service to get seller details by the id
def get_seller_by_id(user_id: UUID):
    response = supabase_admin.table("Seller").select("*").eq("userID", str(user_id)).execute()
    if not response.data:
        return None
    
    return response.data[0]