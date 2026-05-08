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

    # Hook into Social Impact
    social_impact_service.create_impact(purchase_id)

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
    
    items = items_res.data or []

    if not items:
        return []
    
    purchases_ids = list(set(item["purchaseID"] for item in items))
    
    # Get purchases
    purchases_res = supabase_admin.table("Purchase") \
        .select("*") \
        .in_("purchaseID", purchases_ids) \
        .execute()
    
    purchases = purchases_res.data or []

    for purchase in purchases:
        purchase["items"] = [
            item for item in items
            if item["purchaseID"] == purchase["purchaseID"]
        ]

    return purchases_res.data