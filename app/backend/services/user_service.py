from database import supabase

def fetch_all_users():
    return supabase.table("User").select("*").execute()

def fetch_user_by_id(user_id: int):
    return supabase.table("User").select("*").eq("userID", user_id).single().execute()