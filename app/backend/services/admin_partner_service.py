"""
    Service for handling admin actions related to partners.
"""
from database import supabase_admin

# Service to update seller verification status
def update_seller_verification(seller_id: str, is_verified: bool) -> dict | None:
    response = (
        supabase_admin.table("Seller")
        .update({"isVerified": is_verified})
        .eq("userID", seller_id)
        .execute()
    )
    if not response.data:
        return None
    return response.data[0]
