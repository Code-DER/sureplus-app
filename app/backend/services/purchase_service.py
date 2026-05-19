"""
    Service layer for handling purchase-related operations, including creating purchases,
"""
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
        
        # Handle specific stock/not found errors
        if "Not enough stock" in err_msg:
            raise HTTPException(status_code=400, detail=err_msg)
        if "Food item" in err_msg and "not found" in err_msg:
            raise HTTPException(status_code=404, detail=err_msg)
            
        # Include the underlying message to help debug deployment issues like X-1
        detail = f"{error_detail}: {err_msg}"
        raise HTTPException(status_code=500, detail=detail) from exc

def create_purchase(data: dict, user_id: str):
    """
    Creates a purchase atomically using a Postgres RPC.
    """
    if not data["items"]:
        raise HTTPException(status_code=400, detail="Purchase must have at least one item")

    response = _execute(
        supabase_admin.rpc("create_purchase_atomic", {
            "p_user_id": user_id,
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

    # Prevent duplicate completion
    if purchase["status"] == "completed":
        raise HTTPException(status_code=400, detail="Purchase already completed")

    # 2. Update status to completed
    _execute(
        supabase_admin.table("Purchase").update({
            "status": "completed"
        }).eq("purchaseID", purchase_id),
        "Failed to update purchase status"
    )

    # 3. Compute and persist social impact (non-critical — log and continue on failure)
    try:
        social_impact_service.create_impact(purchase_id)
    except Exception as exc:
        logger.warning("Social impact creation failed for purchase %s: %s", purchase_id, exc)

    # L-4: Notify buyer on impact creation (non-critical — never fail the purchase)
    try:
        notification_service.send_notification(
            user_id=purchase["userID"],
            title="Your Impact Summary is Ready 🌱",
            message="Your purchase rescued food and offset carbon. Check your impact!",
            type="impact",
            link="/impact"
        )
    except Exception as exc:
        logger.warning("Impact notification failed for purchase %s: %s", purchase_id, exc)

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

def approve_purchase(purchase_id: str, seller_id: str):
    """
    Seller approves a pending purchase that contains their items.
    Triggers completion, social impact, points, and buyer notification.
    """
    # 1. Verify purchase exists and is still pending
    purchase_res = _execute(
        supabase_admin.table("Purchase")
            .select("purchaseID, userID, status")
            .eq("purchaseID", purchase_id)
            .single(),
        "Failed to fetch purchase for approval"
    )
    purchase = purchase_res.data
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    if purchase["status"] != "pending":
        raise HTTPException(status_code=400, detail="Only pending orders can be approved")

    # 2. Verify at least one item belongs to this seller's shop
    foods_res = _execute(
        supabase_admin.table("Food").select("foodID").eq("userID", seller_id),
        "Failed to fetch seller food"
    )
    seller_food_ids = {f["foodID"] for f in (foods_res.data or [])}
    if not seller_food_ids:
        raise HTTPException(status_code=403, detail="No listings found for your shop")

    items_res = _execute(
        supabase_admin.table("PurchaseItems").select("foodID").eq("purchaseID", purchase_id),
        "Failed to fetch purchase items"
    )
    purchase_food_ids = {i["foodID"] for i in (items_res.data or [])}

    if not seller_food_ids.intersection(purchase_food_ids):
        raise HTTPException(status_code=403, detail="This order does not contain items from your shop")

    # 3. Complete the purchase (status → completed, social impact, points, impact notification)
    result = complete_purchase(purchase_id)

    # 4. Notify buyer that their order was approved (non-critical)
    try:
        notification_service.send_notification(
            user_id=purchase["userID"],
            title="Order Approved ✅",
            message="Your order has been approved by the seller and is now complete!",
            type="order",
            link="/history"
        )
    except Exception as exc:
        logger.warning("Order approval notification failed for purchase %s: %s", purchase_id, exc)

    return result


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

def get_seller_orders(seller_id: str) -> list:
    """
    Return enriched order rows for a seller — one row per purchase item.
    Each row includes buyer name, food name, quantity, per-item total, and status.
    """
    foods_res = _execute(
        supabase_admin.table("Food") \
            .select("foodID, foodName") \
            .eq("userID", seller_id),
        "Failed to fetch seller's food for orders"
    )

    food_map = {f["foodID"]: f["foodName"] for f in (foods_res.data or [])}
    food_ids = list(food_map.keys())
    if not food_ids:
        return []

    items_res = _execute(
        supabase_admin.table("PurchaseItems") \
            .select("purchaseID, foodID, quantity, totalPerItem") \
            .in_("foodID", food_ids),
        "Failed to fetch purchase items for orders"
    )

    items = items_res.data or []
    if not items:
        return []

    purchase_ids = list({i["purchaseID"] for i in items})

    purchases_res = _execute(
        supabase_admin.table("Purchase") \
            .select("purchaseID, userID, status, purchaseDate") \
            .in_("purchaseID", purchase_ids),
        "Failed to fetch purchases for orders"
    )
    purchase_map = {p["purchaseID"]: p for p in (purchases_res.data or [])}

    buyer_ids = list({p["userID"] for p in purchase_map.values() if p.get("userID")})
    user_map: dict = {}
    if buyer_ids:
        users_res = _execute(
            supabase_admin.table("User") \
                .select("userID, firstName, lastName") \
                .in_("userID", buyer_ids),
            "Failed to fetch users for orders"
        )
        user_map = {u["userID"]: u for u in (users_res.data or [])}

    rows = []
    for item in items:
        purchase = purchase_map.get(item["purchaseID"], {})
        buyer_id = purchase.get("userID")
        buyer = user_map.get(buyer_id, {})
        first = buyer.get("firstName") or ""
        last  = buyer.get("lastName")  or ""
        rows.append({
            "purchaseID":  item["purchaseID"],
            "buyerName":   f"{first} {last}".strip() or "Unknown",
            "foodName":    food_map.get(item["foodID"], "Unknown"),
            "quantity":    item.get("quantity", 0),
            "totalPerItem": float(item.get("totalPerItem") or 0),
            "status":      purchase.get("status", "unknown"),
            "purchaseDate": purchase.get("purchaseDate"),
        })

    rows.sort(key=lambda r: r.get("purchaseDate") or "", reverse=True)
    return rows

def get_buyer_orders(buyer_id: str) -> list:
    """Return enriched purchase history for a buyer."""
    purchases_res = _execute(
        supabase_admin.table("Purchase") \
            .select("purchaseID, paymentMethod, totalPrice, status, purchaseDate") \
            .eq("userID", buyer_id),
        "Failed to fetch buyer purchases for history"
    )

    purchases = purchases_res.data or []
    if not purchases:
        return []

    purchase_ids = [p["purchaseID"] for p in purchases]

    items_res = _execute(
        supabase_admin.table("PurchaseItems") \
            .select("purchaseID, foodID, quantity, price, totalPerItem") \
            .in_("purchaseID", purchase_ids),
        "Failed to fetch purchase items for history"
    )
    items = items_res.data or []

    food_ids = list({i["foodID"] for i in items})
    food_map: dict = {}
    if food_ids:
        foods_res = _execute(
            supabase_admin.table("Food") \
                .select("foodID, foodName, userID, picture") \
                .in_("foodID", food_ids),
            "Failed to fetch food details for history"
        )
        food_map = {f["foodID"]: f for f in (foods_res.data or [])}

    seller_ids = list({f.get("userID") for f in food_map.values() if f.get("userID")})
    seller_name_map: dict = {}
    if seller_ids:
        sellers_res = _execute(
            supabase_admin.table("Seller") \
                .select("userID, companyName") \
                .in_("userID", seller_ids),
            "Failed to fetch seller names for history"
        )
        for s in (sellers_res.data or []):
            seller_name_map[s["userID"]] = s.get("companyName") or "Unknown Seller"

    items_by_purchase: dict = {}
    for item in items:
        pid = item["purchaseID"]
        if pid not in items_by_purchase:
            items_by_purchase[pid] = []
        food = food_map.get(item["foodID"], {})
        items_by_purchase[pid].append({
            "foodID": item["foodID"],
            "foodName": food.get("foodName", "Unknown"),
            "picture": food.get("picture"),
            "quantity": item.get("quantity", 0),
            "price": float(item.get("price") or 0),
            "totalPerItem": float(item.get("totalPerItem") or 0),
        })

    rows = []
    for p in purchases:
        pid = p["purchaseID"]
        purchase_items = items_by_purchase.get(pid, [])
        seller_name = "Unknown Seller"
        if purchase_items:
            food = food_map.get(purchase_items[0]["foodID"], {})
            seller_uid = food.get("userID")
            if seller_uid:
                seller_name = seller_name_map.get(seller_uid, "Unknown Seller")

        rows.append({
            "purchaseID": pid,
            "purchaseDate": p.get("purchaseDate"),
            "storeName": seller_name,
            "paymentMethod": p.get("paymentMethod", ""),
            "totalPrice": float(p.get("totalPrice") or 0),
            "status": p.get("status", "pending"),
            "items": purchase_items,
        })

    rows.sort(key=lambda r: r.get("purchaseDate") or "", reverse=True)
    return rows
