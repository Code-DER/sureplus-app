from database import supabase_admin
from models.rating import RatingCreate, RatingUpdate

def create_rating(buyer_id: str, data: RatingCreate):
    """
    Submit a new rating for a purchase.
    """
    rating_data = data.model_dump()
    rating_data["buyerID"] = buyer_id
    
    return supabase_admin.table("Rating").insert(rating_data).execute()

def fetch_ratings_by_seller(seller_id: str):
    """
    Fetch all ratings for a specific seller.
    """
    return supabase_admin.table("Rating") \
        .select("*") \
        .eq("sellerID", seller_id) \
        .order("createdAt", desc=True) \
        .execute()

def fetch_rating_by_purchase(purchase_id: str):
    """
    Fetch the rating for a specific purchase.
    """
    return supabase_admin.table("Rating") \
        .select("*") \
        .eq("purchaseID", purchase_id) \
        .maybe_single() \
        .execute()

def update_rating(rating_id: str, buyer_id: str, data: RatingUpdate):
    """
    Update an existing rating.
    """
    return supabase_admin.table("Rating") \
        .update(data.model_dump(exclude_unset=True)) \
        .eq("ratingID", rating_id) \
        .eq("buyerID", buyer_id) \
        .execute()

def delete_rating(rating_id: str, buyer_id: str):
    """
    Delete a rating.
    """
    return supabase_admin.table("Rating") \
        .delete() \
        .eq("ratingID", rating_id) \
        .eq("buyerID", buyer_id) \
        .execute()
