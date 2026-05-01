from database import supabase
from uuid import UUID

# User Service to fetch all users and their details
def fetch_all_users():
    return supabase.table("User").select("*").execute()

# User Service to fetch a user by their id
def fetch_user_by_id(user_id: int):
    return supabase.table("User").select("*").eq("userID", user_id).single().execute()

# User Service to create a seller profile
def create_seller_profile(user_id: UUID, company_name: str, seller_type: str):
    # Seller information
    seller_data = {
        "userID": str(user_id),
        "companyName": company_name,
        "sellerType": seller_type,
        "isVerified": False
    }
    
    # Insert the seller information into Seller table
    response = supabase.table("Seller").insert(seller_data).execute()

    # Return the seller profile creation
    return response