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
            .select("foodID, price, stockQuantity") \
            .eq("foodID", str(item["foodID"])) \
            .single() \
            .execute()

        if not food_res.data:
            raise Exception(f"Food {item['foodID']} not found")

        food = food_res.data

        # Stock validation
        if food["stockQuantity"] < item["quantity"]:
            raise Exception("Insufficient stock")

        item_total = float(food["price"]) * item["quantity"]
        total += item_total

        purchase_items.append({
            "foodID": str(item["foodID"]),
            "quantity": item["quantity"],
            "price": food["price"],
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
    supabase.table("Purchase").update({
        "status": "completed"
    }).eq("purchaseID", purchase_id).execute()

    # Hook into Social Impact
    social_impact_service.create_impact(purchase_id)

    # Update status
    supabase_admin.table("Purchase") \
        .update({"status": "completed"}) \
        .eq("purchaseID", purchase_id) \
        .execute()

    # Hook into social impact
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