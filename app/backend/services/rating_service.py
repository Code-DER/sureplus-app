from database import supabase_admin
from fastapi import HTTPException
from services.notification_service import send_notification

def create_rating(data):

    # Creates a rating ONLY if:
    #   - purchase belongs to buyer
    #   - purchase is completed
    #   - buyer hasn't already rated this buyer (purchase)

    purchase_id = data["purchaseID"]
    rating_value = data["rating"]

    # Check rating range
    if rating_value < 1 or rating_value > 5:
        raise HTTPException(status_code=400, detail="Rating Mus be between 1 and 5")
    
    # Check if purchase exist and belongs to buyer
    purchase_res = supabase_admin.table("Purchase") \
        .select("userID, status") \
        .eq("purchaseID", purchase_id) \
        .single() \
        .execute()
    
    if not purchase_res.data:
        raise HTTPException(status_code=400, detail="Purchase not found")
    
    purchase = purchase_res.data
    buyer_id = purchase["userID"]
    
    # Check if purchase is completed
    if purchase["status"] != "completed":
        raise HTTPException(status_code=400, detail="You can only rate completed purchases")
    
    # Prevent duplicate rating for same purchases
    existing_rating = supabase_admin.table("Rating") \
        .select("ratingID") \
        .eq("purchaseID", purchase_id) \
        .eq("buyerID", buyer_id) \
        .execute()
    
    if existing_rating.data:
        raise HTTPException(status_code=400, detail="You already rated this purchase")
    
    # Get sellerID from PurchaseItems
    purchase_items = supabase_admin.table("PurchaseItems") \
        .select("foodID") \
        .eq("purchaseID", purchase_id) \
        .execute()
    
    if not purchase_items.data:
        raise HTTPException(status_code=400, detail="No items found for this purchase")
    
    # Assuming one seller per purchase
    food_id = purchase_items.data[0]["foodID"]

    food_res = supabase_admin.table("Food") \
        .select("userID") \
        .eq("foodID", food_id) \
        .single() \
        .execute()

    if not food_res.data:
        raise HTTPException(status_code=400, detail="Food Not Found")

    seller_id = food_res.data["userID"]
    
    # Insert rating into the database
    result = supabase_admin.table("Rating").insert({
        "purchaseID": purchase_id,
        "buyerID": buyer_id,
        "sellerID": seller_id,
        "rating": rating_value,
        "comment": data.get("comment")
    }).execute()

    send_notification(
        user_id=seller_id,
        title="New Rating Received",
        message=f"You received a {rating_value}⭐ rating from a buyer.",
        type="rating",
        link=f"/seller/ratings"
    )

    return result.data[0]

def get_seller_rating_list(seller_id):
    res = supabase_admin.table("Rating") \
        .select("*") \
        .eq("sellerID", seller_id) \
        .execute()
    
    return res.data