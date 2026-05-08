from database import supabase_admin
from services import social_impact_service
from models.purchase import PurchaseCreateWithItems

def create_purchase(user_id: str, data: PurchaseCreateWithItems):
    """
    Create a new purchase with multiple line items.
    """
    # 1. Insert into Purchase table
    purchase_data = {
        "userID": user_id,
        "paymentMethod": data.paymentMethod,
        "totalPrice": data.totalPrice,
        "status": "pending"
    }
    
    purchase_res = supabase_admin.table("Purchase").insert(purchase_data).execute()
    
    if not purchase_res.data:
        return None
    
    purchase_id = purchase_res.data[0]["purchaseID"]
    
    # 2. Bulk-insert all PurchaseItems rows
    items_to_insert = []
    for item in data.items:
        items_to_insert.append({
            "purchaseID": purchase_id,
            "foodID": str(item.foodID),
            "quantity": item.quantity,
            "totalPerItem": item.totalPerItem
        })
    
    items_res = supabase_admin.table("PurchaseItems").insert(items_to_insert).execute()
    
    if not items_res.data:
        # Should we rollback? Supabase doesn't support easy transactions via client
        pass

    # 3. Complete purchase to trigger social impact
    complete_purchase(purchase_id)
    
    return purchase_res.data[0]

def fetch_all_purchases(user_id: str):
    """
    Fetch all purchases for a specific user.
    """
    return supabase_admin.table("Purchase") \
        .select("*") \
        .eq("userID", user_id) \
        .order("purchaseDate", desc=True) \
        .execute()

def fetch_purchase_by_id(purchase_id: str):
    """
    Fetch a single purchase with its line items and food details.
    """
    purchase = supabase_admin.table("Purchase") \
        .select("*, PurchaseItems(*, Food(*))") \
        .eq("purchaseID", purchase_id) \
        .single() \
        .execute()
    
    return purchase

def cancel_purchase(purchase_id: str):
    """
    Cancel a pending purchase.
    """
    return supabase_admin.table("Purchase") \
        .update({"status": "cancelled"}) \
        .eq("purchaseID", purchase_id) \
        .eq("status", "pending") \
        .execute()

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

def get_seller_purchase_list(seller_id: str):
    """
    Fetch all purchases that contain items from a specific seller.
    """
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
