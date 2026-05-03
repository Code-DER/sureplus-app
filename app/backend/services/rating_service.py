from database import supabase

def create_rating(data):

    # Creates a rating ONLY if:
    #   - purchase belongs to buyer
    #   - purchase is complted
    #   - buyer hasn't already rated this buyer (purchase)

    purchase_id = data["purchaseID"]
    buyer_id = data["buyerID"]
    seller_id = data["sellerID"]

    # Check if purchase exist and belongs to buyer
    purchase_res = supabase.table("Purchase") \
        .select("userID, status") \
        .eq("purchaseID", purchase_id) \
        .single() \
        .execute()
    
    if not purchase_res.data:
        raise Exception("Purchase not found")
    
    purchase = purchase_res.data

    if purchase["userID"] != buyer_id:
        raise Exception("You cannot rate a purchase you did not make")
    
    # Check if purchase is completed
    if purchase["status"] != "completed":
        raise Exception("You can only rate completed purchases")
    
    # Prevent duplicate rating for same purchases
    existing_rating = supabase.table("Rating") \
        .select("ratingID") \
        .eq("purchaseID", purchase_id) \
        .eq("buyerID", buyer_id) \
        .execute()
    
    if existing_rating.data:
        raise Exception("You already rated this purchase")
    
    # Rating validation
    rating_value = data["rating"]

    if rating_value < 1 or rating_value > 5:
        raise Exception("Rating Mus be between 1 and 5")
    
    # Insert rating into the database
    result = supabase.table("Rating").insert({
        "purchaseID": data["purchaseID"],
        "buyerID": data["buyerID"],
        "sellerID": data["sellerID"],
        "rating": data["rating"],
        "comment": data.get("comment")
    }).execute()

    return result.data[0]