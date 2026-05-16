import logging
from typing import Optional
from fastapi import HTTPException
from database import supabase_admin
from services import social_impact_service, notification_service

logger = logging.getLogger(__name__)

def _execute(query, error_detail: str):
    """
    Helper to execute Supabase queries and handle exceptions.
    """
    try:
        return query.execute()
    except Exception as exc:
        logger.exception(error_detail)
        err_msg = str(exc)
        if "Not enough stock" in err_msg:
            raise HTTPException(status_code=400, detail=err_msg)
        if "Food item" in err_msg and "not found" in err_msg:
            raise HTTPException(status_code=404, detail=err_msg)
            
        raise HTTPException(status_code=500, detail=error_detail) from exc

def create_purchase(data):
    """
    Creates a purchase atomically using a Postgres RPC.
    """
    if not data["items"]:
        raise HTTPException(status_code=400, detail="Purchase must have at least one item")

    response = _execute(
        supabase_admin.rpc("create_purchase_atomic", {
            "p_user_id": data["userID"],
            "p_payment_method": data["paymentMethod"],
            "p_items": data["items"]
        }),
        "Failed to create purchase"
    )

    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create purchase")

    return response.data[0]

def complete_purchase(purchase_id: str):
    # 1. Get purchase info
    purchase_res = _execute(
        supabase_admin.table("Purchase") \
            .select("userID, totalPrice, status") \
            .eq("purchaseID", purchase_id) \
            .single(),
        "Failed to fetch purchase info"
    )

    purchase = purchase_res.data

    # Prevent double completion
    if purchase["status"] == "completed":
        raise HTTPException(status_code=400, detail="Purchase already completed")

    # 2. Update status to completed
    _execute(
        supabase_admin.table("Purchase").update({
            "status": "completed"
        }).eq("purchaseID", purchase_id),
        "Failed to update purchase status"
    )

    # 3. Compute and persist social impact
    social_impact_service.create_impact(purchase_id)

    # L-4: Notify buyer on impact creation
    notification_service.send_notification(
        user_id=purchase["userID"],
        title="Your Impact Summary is Ready 🌱",
        message="Your purchase rescued food and offset carbon. Check your impact!",
        type="impact",
        link="/impact"
    )

    # 4. Award buyer points (₱10 = 1 point)
    points_earned = int(float(purchase["totalPrice"]) // 10)
    
    buyer_res = _execute(
        supabase_admin.table("Buyer") \
            .select("points").eq("userID", purchase["userID"]).single(),
        "Failed to fetch buyer points"
    )
    
    if buyer_res.data:
        current_points = float(buyer_res.data.get("points", 0))
        _execute(
            supabase_admin.table("Buyer").update({
                "points": current_points + points_earned
            }).eq("userID", purchase["userID"]),
            "Failed to update buyer points"
        )

    return {
        "message": "Purchase completed",
        "pointsEarned": points_earned
    }

def fetch_purchase_owner(purchase_id: str) -> Optional[str]:
    """
    Fetch the userID of the buyer who made the purchase.
    Used for ownership checks in the API layer (L-5).
    """
    res = _execute(
        supabase_admin.table("Purchase") \
            .select("userID") \
            .eq("purchaseID", purchase_id) \
            .single(),
        "Failed to fetch purchase owner"
    )
    return res.data["userID"] if res.data else None

def get_buyer_food_list(buyer_id: str):
    """
    Fetch all food items purchased by a buyer that have remaining donatable quantity.
    Joined with Food table for details (name, weight, expiry).
    """
    # 1. Get all completed purchases for this buyer
    purchases_res = _execute(
        supabase_admin.table("Purchase") \
            .select("purchaseID") \
            .eq("userID", buyer_id) \
            .eq("status", "completed"),
        "Failed to fetch buyer purchases"
    )
    
    purchase_ids = [p["purchaseID"] for p in purchases_res.data]
    if not purchase_ids:
        return []

    # 2. Get purchase items with remaining quantity, joined with Food details
    items_res = _execute(
        supabase_admin.table("PurchaseItems") \
            .select("*, Food(*)") \
            .in_("purchaseID", purchase_ids),
        "Failed to fetch purchased food items"
    )
    
    # Filter for items with remaining quantity and format for frontend
    # B-8: Only return edible food items
    from datetime import date
    today = date.today().isoformat()
    
    results = []
    for item in items_res.data:
        donatable_qty = item["quantity"] - item.get("donatedQuantity", 0)
        food = item["Food"]
        
        # Check if still donatable and edible
        if donatable_qty > 0 and food.get("isEdible") is not False:
            # Check expiration if present
            if food.get("expirationDate") and food["expirationDate"] < today:
                continue
                
            results.append({
                "purchaseID": item["purchaseID"],
                "foodID": item["foodID"],
                "foodName": food["foodName"],
                "description": food["description"],
                "picture": food["picture"],
                "weightKg": food["weightKg"],
                "expirationDate": food["expirationDate"],
                "purchasedQuantity": item["quantity"],
                "donatableQuantity": donatable_qty,
                "pricePaid": float(item["totalPerItem"]) / item["quantity"]
            })
            
    # Sort by expiration date (soonest first)
    results.sort(key=lambda x: x["expirationDate"] or "9999-12-31")
    
    return results

def get_seller_purchase_list(seller_id):
    """
    Fetch all purchases containing food items from a specific seller.
    """
    # Get seller's food
    foods_res = _execute(
        supabase_admin.table("Food") \
            .select("foodID") \
            .eq("userID", seller_id),
        "Failed to fetch seller's food"
    )
    
    food_ids = [f["foodID"] for f in foods_res.data]

    if not food_ids:
        return []
    
    # Get purchase items
    items_res = _execute(
        supabase_admin.table("PurchaseItems") \
            .select("purchaseID") \
            .in_("foodID", food_ids),
        "Failed to fetch purchase items"
    )
    
    purchase_ids = list(set([i["purchaseID"] for i in items_res.data]))

    if not purchase_ids:
        return []
    
    # Get purchases
    purchases_res = _execute(
        supabase_admin.table("Purchase") \
            .select("*") \
            .in_("purchaseID", purchase_ids),
        "Failed to fetch purchases"
    )

    return purchases_res.data
