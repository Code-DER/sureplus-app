from database import supabase

# User Service to fetch all users and their details
def fetch_all_users():
    return supabase.table("User").select("*").execute()

# User Service to fetch a user by their id
def fetch_user_by_id(user_id: int):
    return supabase.table("User").select("*").eq("userID", user_id).single().execute()