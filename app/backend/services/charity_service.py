"""
Service for handling charity-related database operations.
"""
from database import supabase

def fetch_all_charities():
    """
    Fetch all charities from the database.
    """
    return supabase.table("Charity").select("*").execute()

def fetch_charity_by_id(user_id: str):
    """
    Fetch a single charity by userID.
    """
    return supabase.table("Charity").select("*").eq("userID", user_id).single().execute()

def update_charity(user_id: str, data: dict):
    """
    Update a charity's information.
    """
    return supabase.table("Charity").update(data).eq("userID", user_id).execute()

def fetch_charity_profile(user_id: str):
    """
    Fetch a charity's profile by joining with the User table.
    """
    # Join Charity with User table
    return supabase.table("Charity") \
        .select("*, User!inner(*)") \
        .eq("userID", user_id) \
        .single() \
        .execute()
