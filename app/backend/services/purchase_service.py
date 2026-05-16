from database import supabase_admin
from services import social_impact_service


def create_purchase(data: dict, user_id: str):
    if not data["items"]:
        raise Exception("Purchase must have at least one item")

    total = 0
    purchase_items = []

    # Process items
    for item in data["items"]:
        food_res = supabase_admin.table("Food") \
            .select("foodID, price, stockQuantity, userID") \
            .eq("foodID", str(item["foodID"])) \
            .single() \
            .execute()

        if not food_res.data:
            raise Exception(f"Food {item['foodID']} not found")

        food = food_res.data

        if food["userID"] == user_id:
            raise Exception("You cannot purchase your own listing")

        # Stock validation
        if food["stockQuantity"] < item["quantity"]:
            raise Exception("Insufficient stock")

        item_total = float(food["price"]) * item["quantity"]
        total += item_total

        purchase_items.append({
            "foodID": str(item["foodID"]),
            "quantity": item["quantity"],
            "price": float(food["price"]),
            "totalPerItem": item_total
        })

        # Update stock
        supabase_admin.table("Food") \
            .update({
                "stockQuantity": food["stockQuantity"] - item["quantity"]
            }) \
            .eq("foodID", str(item["foodID"])) \
            .execute()

    # Create purchase
    purchase_res = supabase_admin.table("Purchase").insert({
        "userID": user_id,
        "paymentMethod": data["paymentMethod"],
        "totalPrice": total,
        "status": "pending"
    }).execute()

    if not purchase_res.data:
        raise Exception("Failed to create purchase")

    purchase_id = purchase_res.data[0]["purchaseID"]

    # Insert purchase items
    for item in purchase_items:
        item["purchaseID"] = purchase_id

    supabase_admin.table("PurchaseItems") \
        .insert(purchase_items) \
        .execute()

    return {
        "purchaseID": purchase_id,
        "total": total,
        "status": "pending"
    }


def complete_purchase(purchase_id: str):
    # Get purchase info
    purchase_res = supabase_admin.table("Purchase") \
        .select("userID, totalPrice, status") \
        .eq("purchaseID", purchase_id) \
        .single() \
        .execute()

    if not purchase_res.data:
        raise Exception("Purchase not found")

    purchase = purchase_res.data

    # Prevent duplicate completion
    if purchase["status"] == "completed":
        return {"message": "Already completed"}
    
    # Update status to completed
    supabase_admin.table("Purchase").update({
        "status": "completed"
    }).eq("purchaseID", purchase_id).execute()

    # Hook into Social Impact
    social_impact_service.create_impact(purchase_id)

    # Compute points
    total = float(purchase["totalPrice"])
    points_earned = int(total // 10)

    # Get buyer points
    buyer_res = supabase_admin.table("Buyer") \
        .select("points") \
        .eq("userID", purchase["userID"]) \
        .single() \
        .execute()

    current_points = float(buyer_res.data[0].get("points", 0))

    # Update buyer points
    supabase_admin.table("Buyer") \
        .update({
            "points": current_points + points_earned
        }) \
        .eq("userID", purchase["userID"]) \
        .execute()

    return {
        "message": "Purchase completed",
        "pointsEarned": points_earned
    }


def get_seller_purchase_list(seller_id: str):
    # Get seller foods
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

def get_buyer_orders(buyer_id: str) -> list:
    """Return enriched purchase history for a buyer."""
    purchases_res = supabase_admin.table("Purchase") \
        .select("purchaseID, paymentMethod, totalPrice, status, purchaseDate") \
        .eq("userID", buyer_id) \
        .execute()

    purchases = purchases_res.data or []
    if not purchases:
        return []

    purchase_ids = [p["purchaseID"] for p in purchases]

    items_res = supabase_admin.table("PurchaseItems") \
        .select("purchaseID, foodID, quantity, price, totalPerItem") \
        .in_("purchaseID", purchase_ids) \
        .execute()
    items = items_res.data or []

    food_ids = list({i["foodID"] for i in items})
    food_map: dict = {}
    if food_ids:
        foods_res = supabase_admin.table("Food") \
            .select("foodID, foodName, userID") \
            .in_("foodID", food_ids) \
            .execute()
        food_map = {f["foodID"]: f for f in (foods_res.data or [])}

    seller_ids = list({f.get("userID") for f in food_map.values() if f.get("userID")})
    seller_name_map: dict = {}
    if seller_ids:
        sellers_res = supabase_admin.table("Seller") \
            .select("userID, companyName") \
            .in_("userID", seller_ids) \
            .execute()
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
