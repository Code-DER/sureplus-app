from database import supabase_admin
from services import social_impact_service

def create_purchase(data):
    if not data["items"]:
        raise Exception("Purchase must have at least one item")

    total = 0
    items = []

    for item in data["items"]:
        food_res = supabase_admin.table("Food") \
            .select("price, stockQuantity") \
            .eq("foodID", item["foodID"]) \
            .execute()

        if not food_res.data:
            raise Exception("Food not found")

        food = food_res.data[0]
        price = float(food["price"])
        stock = food["stockQuantity"]

        # Stock check
        if item["quantity"] > stock:
            raise Exception("Not enough stock")

        subtotal = price * item["quantity"]
        total += subtotal

        items.append({
            "foodID": item["foodID"],
            "quantity": item["quantity"],
            "price": price,
            "totalPerItem": subtotal
        })

        # Update stock
        new_stock = stock - item["quantity"]
        supabase_admin.table("Food").update({
            "stockQuantity": new_stock
        }).eq("foodID", item["foodID"]).execute()

    # Insert info to purchase table (Default Status: pending)
    purchase = supabase_admin.table("Purchase").insert({
        "userID": data["userID"],
        "paymentMethod": data["paymentMethod"],
        "totalPrice": total,
        "status": "pending"
    }).execute()

    purchase_id = purchase.data[0]["purchaseID"]

    # Insert PurchaseItems
    for i in items:
        i["purchaseID"] = purchase_id
        supabase_admin.table("PurchaseItems").insert(i).execute()

    return purchase.data[0]

def complete_purchase(purchase_id):
    # Get purchase info
    purchase_res = supabase_admin.table("Purchase") \
        .select("userID, totalPrice, status") \
        .eq("purchaseID", purchase_id) \
        .single() \
        .execute()

    if not purchase_res.data:
        raise Exception("Purchase not found")

    purchase = purchase_res.data

    # Prevent double completion
    if purchase["status"] == "completed":
        raise Exception("Purchase already completed")

    # Update status to completed
    supabase_admin.table("Purchase").update({
        "status": "completed"
    }).eq("purchaseID", purchase_id).execute()

    # Compute points
    total = float(purchase["totalPrice"])
    points_earned = int(total // 10)

    # Get current points
    buyer_res = supabase_admin.table("Buyer") \
        .select("points") \
        .eq("userID", purchase["userID"]) \
        .single() \
        .execute()

    current_points = float(buyer_res.data.get("points", 0))

    # Update points
    supabase_admin.table("Buyer").update({
        "points": current_points + points_earned
    }).eq("userID", purchase["userID"]).execute()

    return {
        "message": "Purchase completed",
        "pointsEarned": points_earned
    }

def get_seller_purchase_list(seller_id):
    # Get seller's food
    foods_res = supabase_admin.table("Food") \
        .select("foodID") \
        .eq("userID", seller_id) \
        .execute()

    food_ids = [f["foodID"] for f in foods_res.data]

    if not food_ids:
        return []

    # Get purchase items
    items_res = supabase_admin.table("PurchaseItems") \
        .select("purchaseID") \
        .in_("foodID", food_ids) \
        .execute()

    purchase_ids = list(set([i["purchaseID"] for i in items_res.data]))

    if not purchase_ids:
        return []

    # Get purchases
    purchases_res = supabase_admin.table("Purchase") \
        .select("*") \
        .in_("purchaseID", purchase_ids) \
        .execute()

    return purchases_res.data


def get_seller_orders(seller_id: str) -> list:
    """
    Return enriched order rows for a seller — one row per purchase item.
    Each row includes buyer name, food name, quantity, per-item total, and status.
    """
    foods_res = supabase_admin.table("Food") \
        .select("foodID, foodName") \
        .eq("userID", seller_id) \
        .execute()

    food_map = {f["foodID"]: f["foodName"] for f in (foods_res.data or [])}
    food_ids = list(food_map.keys())
    if not food_ids:
        return []

    items_res = supabase_admin.table("PurchaseItems") \
        .select("purchaseID, foodID, quantity, totalPerItem") \
        .in_("foodID", food_ids) \
        .execute()

    items = items_res.data or []
    if not items:
        return []

    purchase_ids = list({i["purchaseID"] for i in items})

    purchases_res = supabase_admin.table("Purchase") \
        .select("purchaseID, userID, status, purchaseDate") \
        .in_("purchaseID", purchase_ids) \
        .execute()
    purchase_map = {p["purchaseID"]: p for p in (purchases_res.data or [])}

    buyer_ids = list({p["userID"] for p in purchase_map.values() if p.get("userID")})
    user_map: dict = {}
    if buyer_ids:
        users_res = supabase_admin.table("User") \
            .select("userID, firstName, lastName") \
            .in_("userID", buyer_ids) \
            .execute()
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

def complete_purchase(purchase_id: str):
    """
    Mark a purchase as completed and trigger social impact calculation.
    """
    response = supabase_admin.table("Purchase") \
        .update({"status": "completed"}) \
        .eq("purchaseID", purchase_id) \
        .execute()
    
    if response.data:
        # Hook into Social Impact
        social_impact_service.create_impact(purchase_id)
    
    return response
