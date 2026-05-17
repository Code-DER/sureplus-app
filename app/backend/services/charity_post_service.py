"""
Service for handling charity post database operations.
"""
import logging
from fastapi import HTTPException
from database import supabase_admin

logger = logging.getLogger(__name__)

def _execute(query, error_detail: str):
    """
    Helper to execute Supabase queries and handle exceptions.
    """
    try:
        return query.execute()
    except Exception as exc:
        logger.exception(error_detail)
        # Check if it's a known error message from our RPCs
        err_msg = str(exc)
        if "Money goal already reached" in err_msg or "Food goal already reached" in err_msg:
            raise HTTPException(status_code=400, detail=err_msg)
        if "Not enough stock" in err_msg:
            raise HTTPException(status_code=400, detail=err_msg)
        if "does not accept" in err_msg:
            raise HTTPException(status_code=400, detail=err_msg)
            
        raise HTTPException(status_code=500, detail=error_detail) from exc

def fetch_all_posts(limit: int = 10, offset: int = 0, search: str = None, donation_mode: str = None, status: str = None):
    """
    Fetch all charity posts ordered by createdAt DESC with pagination and search.
    """
    query = supabase_admin.table("CharityPost").select("*, Charity(isPartner)").order("createdAt", desc=True)
    
    if search:
        query = query.or_(f"title.ilike.%{search}%,description.ilike.%{search}%")
        
    if donation_mode:
        query = query.eq("donationMode", donation_mode)
        
    if status:
        query = query.eq("status", status)
        
    return _execute(query.range(offset, offset + limit - 1), "Failed to fetch charity posts")

def fetch_post_by_id(charity_id: str):
    """
    Fetch a single charity post by charityID.
    """
    return _execute(
        supabase_admin.table("CharityPost").select("*, Charity(isPartner)").eq("charityID", charity_id).single(),
        "Failed to fetch charity post"
    )

def fetch_posts_by_user(user_id: str, limit: int = 100, offset: int = 0):
    """
    Fetch all charity posts for a specific user (charity) with pagination.
    """
    query = supabase_admin.table("CharityPost").select("*, Charity(isPartner)").eq("userID", user_id).order("createdAt", desc=True)
    return _execute(query.range(offset, offset + limit - 1), "Failed to fetch user's charity posts")

def fetch_user_post_stats(user_id: str):
    """
    Fetch aggregate statistics for a user's charity posts.
    """
    # We fetch only the necessary columns to compute stats efficiently
    res = _execute(
        supabase_admin.table("CharityPost").select("currentAmount, currentFoodKg, status").eq("userID", user_id),
        "Failed to fetch user post stats"
    )
    
    posts = res.data or []
    return {
        "totalRaised": sum(p["currentAmount"] or 0 for p in posts),
        "totalFoodKg": sum(p["currentFoodKg"] or 0 for p in posts),
        "activeCount": len([p for p in posts if p["status"] == "active"]),
        "fundedCount": len([p for p in posts if p["status"] == "funded"])
    }

def create_post(user_id: str, data: dict):
    """
    Create a new charity post.
    """
    data["userID"] = user_id
    return _execute(
        supabase_admin.table("CharityPost").insert(data),
        "Failed to create charity post"
    )

def update_post(charity_id: str, data: dict):
    """
    Update an existing charity post.
    """
    return _execute(
        supabase_admin.table("CharityPost").update(data).eq("charityID", charity_id),
        "Failed to update charity post"
    )

def delete_post(charity_id: str):
    """
    Delete a charity post.
    """
    return _execute(
        supabase_admin.table("CharityPost").delete().eq("charityID", charity_id),
        "Failed to delete charity post"
    )

def donate_money(post_id: str, amount: float):
    """
    Increment the currentAmount of a charity post via money donation.
    Uses Postgres RPC for atomicity and goal capping.
    """
    return _execute(
        supabase_admin.rpc("donate_money_to_post", {
            "p_post_id": post_id,
            "p_amount": amount
        }),
        "Failed to process money donation"
    )

def donate_food(post_id: str, food_id: str, quantity: int):
    """
    Increment the currentFoodKg of a charity post via food donation.
    Decrements stock and handles goal capping atomically via RPC.
    Used for seller-originated donations (deprecated in favor of purchased food flow).
    """
    return _execute(
        supabase_admin.rpc("donate_food_to_post", {
            "p_post_id": post_id,
            "p_food_id": food_id,
            "p_quantity": quantity
        }),
        "Failed to process food donation"
    )

def donate_purchased_food(post_id: str, purchase_id: str, food_id: str, quantity: int):
    """
    Increment the currentFoodKg of a charity post via food donation from a buyer's purchase history.
    Updates donatedQuantity on PurchaseItems and handles goal capping atomically via RPC.
    """
    return _execute(
        supabase_admin.rpc("donate_purchased_food_to_post", {
            "p_post_id": post_id,
            "p_purchase_id": purchase_id,
            "p_food_id": food_id,
            "p_quantity": quantity
        }),
        "Failed to process purchased food donation"
    )

def donate_direct_food(post_id: str, food_name: str, food_picture: str, expiry_date: str, weight_kg: float, quantity: int):
    """
    Direct food donation — donor describes food without needing a prior purchase.
    Handles goal capping and status transitions atomically via RPC.
    """
    return _execute(
        supabase_admin.rpc("donate_direct_food_to_post", {
            "p_post_id": post_id,
            "p_food_name": food_name,
            "p_food_picture": food_picture,
            "p_expiry_date": expiry_date,
            "p_weight_kg": weight_kg,
            "p_quantity": quantity,
        }),
        "Failed to process direct food donation"
    )

def record_donation(post_id: str, user_id: str, donation_type: str,
                    amount: float = None, food_id: str = None,
                    quantity: int = None, food_kg: float = None):
    """
    Record a donation event in the Donation audit table.
    """
    return _execute(
        supabase_admin.table("Donation").insert({
            "postID": post_id,
            "userID": user_id,
            "donationType": donation_type,
            "amount": amount,
            "foodID": food_id,
            "quantity": quantity,
            "foodKg": food_kg,
        }),
        "Failed to record donation"
    )

def fetch_donations_by_post(post_id: str):
    """
    Fetch all donations for a specific charity post.
    """
    return _execute(
        supabase_admin.table("Donation") \
            .select("*, User(firstName, lastName, emailAddress), Rating(ratingID)") \
            .eq("postID", post_id) \
            .order("createdAt", desc=True),
        "Failed to fetch post donations"
    )

def fetch_donations_by_user(user_id: str):
    """
    Fetch all donations made by a specific user.
    """
    return _execute(
        supabase_admin.table("Donation") \
            .select("*, CharityPost(title)") \
            .eq("userID", user_id) \
            .order("createdAt", desc=True),
        "Failed to fetch user donations"
    )

def fetch_donation_owner(donation_id: str):
    """
    Fetch the userID of the donor for a specific donation.
    """
    res = _execute(
        supabase_admin.table("Donation")             .select("userID")             .eq("donationID", donation_id)             .single(),
        "Failed to fetch donation owner"
    )
    return res.data.get("userID") if res.data else None
