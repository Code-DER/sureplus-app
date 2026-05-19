"""
    Service layer for handling rating-related operations, including creating ratings and fetching seller ratings.
"""
from database import supabase_admin
from fastapi import HTTPException
from services.notification_service import send_notification

def create_rating(rater_id, data):
    """
    Creates a rating for either a purchase or a donation.
    """
    purchase_id = data.get("purchaseID")
    donation_id = data.get("donationID")
    rating_value = data["rating"]
    comment = data.get("comment")

    if not purchase_id and not donation_id:
        raise HTTPException(status_code=400, detail="Either purchaseID or donationID must be provided")
    
    if purchase_id and donation_id:
        raise HTTPException(status_code=400, detail="Only one of purchaseID or donationID can be provided")

    if rating_value < 1 or rating_value > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    target_id = None

    if purchase_id:
        # Purchase rating: Buyer rates Seller
        purchase_res = supabase_admin.table("Purchase") \
            .select("userID, status") \
            .eq("purchaseID", str(purchase_id)) \
            .single() \
            .execute()
        
        if not purchase_res.data:
            raise HTTPException(status_code=404, detail="Purchase not found")
        
        purchase = purchase_res.data
        if str(purchase["userID"]) != str(rater_id):
            raise HTTPException(status_code=403, detail="You can only rate your own purchases")
            
        if purchase["status"] != "completed":
            raise HTTPException(status_code=400, detail="You can only rate completed purchases")
        
        # Prevent duplicate
        existing = supabase_admin.table("Rating") \
            .select("ratingID") \
            .eq("purchaseID", str(purchase_id)) \
            .execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="You already rated this purchase")

        # Get target sellerID
        purchase_items = supabase_admin.table("PurchaseItems") \
            .select("foodID") \
            .eq("purchaseID", str(purchase_id)) \
            .execute()
        if not purchase_items.data:
            raise HTTPException(status_code=400, detail="No items found for this purchase")
        
        food_res = supabase_admin.table("Food") \
            .select("userID") \
            .eq("foodID", purchase_items.data[0]["foodID"]) \
            .single() \
            .execute()
        
        if not food_res.data:
            raise HTTPException(status_code=404, detail="Food item not found")
            
        target_id = food_res.data["userID"]

    else:
        # Donation rating: Charity rates Donor
        donation_res = supabase_admin.table("Donation") \
            .select("userID, status, postID") \
            .eq("donationID", str(donation_id)) \
            .single() \
            .execute()
        
        if not donation_res.data:
            raise HTTPException(status_code=404, detail="Donation not found")
        
        donation = donation_res.data
        if donation["status"] != "completed":
            raise HTTPException(status_code=400, detail="You can only rate completed donations")
        
        # Check if rater is the charity who owns the post
        post_res = supabase_admin.table("CharityPost") \
            .select("userID") \
            .eq("charityID", donation["postID"]) \
            .single() \
            .execute()
        
        if not post_res.data or str(post_res.data["userID"]) != str(rater_id):
            raise HTTPException(status_code=403, detail="You can only rate donations made to your own posts")
        
        if not donation["userID"]:
             raise HTTPException(status_code=400, detail="Cannot rate anonymous donation")

        target_id = donation["userID"]

        # Prevent duplicate
        existing = supabase_admin.table("Rating") \
            .select("ratingID") \
            .eq("donationID", str(donation_id)) \
            .execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="You already rated this donation")

    # Insert rating
    result = supabase_admin.table("Rating").insert({
        "purchaseID": str(purchase_id) if purchase_id else None,
        "donationID": str(donation_id) if donation_id else None,
        "buyerID": str(rater_id),
        "sellerID": str(target_id),
        "rating": rating_value,
        "comment": comment
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create rating")

    send_notification(
        user_id=str(target_id),
        title="New Rating Received",
        message=f"You received a {rating_value}⭐ rating.",
        type="rating",
        link="/seller/ratings" if purchase_id else "/impact"
    )

    return result.data[0]

# Service to fetch all ratings for a specific seller
def get_seller_rating_list(seller_id):
    res = supabase_admin.table("Rating") \
        .select("*") \
        .eq("sellerID", seller_id) \
        .execute()
    
    return res.data
