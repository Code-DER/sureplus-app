"""
Service for handling charity post database operations.
"""
from database import supabase_admin

def fetch_all_posts(limit: int = 10, offset: int = 0, search: str = None):
    """
    Fetch all charity posts ordered by createdAt DESC with pagination and search.
    """
    query = supabase_admin.table("CharityPost").select("*").order("createdAt", desc=True)
    
    if search:
        query = query.or_(f"title.ilike.%{search}%,description.ilike.%{search}%")
        
    return query.range(offset, offset + limit - 1).execute()

def fetch_post_by_id(charity_id: str):
    """
    Fetch a single charity post by charityID.
    """
    return supabase_admin.table("CharityPost").select("*").eq("charityID", charity_id).single().execute()

def fetch_posts_by_user(user_id: str):
    """
    Fetch all charity posts for a specific user (charity).
    """
    return supabase_admin.table("CharityPost").select("*").eq("userID", user_id).execute()

def create_post(user_id: str, data: dict):
    """
    Create a new charity post.
    """
    data["userID"] = user_id
    return supabase_admin.table("CharityPost").insert(data).execute()

def update_post(charity_id: str, data: dict):
    """
    Update an existing charity post.
    """
    return supabase_admin.table("CharityPost").update(data).eq("charityID", charity_id).execute()

def delete_post(charity_id: str):
    """
    Delete a charity post.
    """
    return supabase_admin.table("CharityPost").delete().eq("charityID", charity_id).execute()

def increment_donation(charity_id: str, amount: float):
    """
    Increment the currentAmount of a charity post.
    Uses Postgres RPC for atomicity.
    """
    return supabase_admin.rpc("increment_charity_amount", {
        "p_charity_id": charity_id,
        "p_amount": amount
    }).execute()
