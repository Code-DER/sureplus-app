import math
from database import supabase_admin

CO2_PER_KG  = 2.5   # kg CO2 equivalent per kg food waste avoided (FAO)
KG_PER_MEAL = 0.5   # kg of food per meal

def compute_metrics(purchase_id: str) -> dict:
    """
    Compute social impact metrics for a given purchase.
    Fetches PurchaseItems joined with Food to get real weightKg.
    """
    # Fetch all PurchaseItems for the purchase joined with Food
    response = supabase_admin.table("PurchaseItems") \
        .select("quantity, Food(weightKg)") \
        .eq("purchaseID", purchase_id) \
        .execute()
    
    items = response.data
    if not items:
        return {"purchaseID": purchase_id, "carbonOffset": 0, "rescuedKilos": 0, "peopleFed": 0}
    
    rescued_kilos = sum(item["quantity"] * (item["Food"]["weightKg"] if item["Food"] else 0.5) for item in items)
    carbon_offset = rescued_kilos * CO2_PER_KG
    people_fed    = math.floor(rescued_kilos / KG_PER_MEAL)
    
    return {
        "purchaseID": purchase_id,
        "carbonOffset": carbon_offset,
        "rescuedKilos": rescued_kilos,
        "peopleFed": people_fed
    }

def create_impact(purchase_id: str):
    """
    Compute metrics and create a record in the SocialImpact table.
    """
    metrics = compute_metrics(purchase_id)
    return supabase_admin.table("SocialImpact").insert(metrics).execute()

def fetch_impact_by_purchase(purchase_id: str):
    """
    Fetch the social impact record for a specific purchase.
    """
    return supabase_admin.table("SocialImpact") \
        .select("*") \
        .eq("purchaseID", purchase_id) \
        .single() \
        .execute()

def fetch_summary_by_seller(seller_id: str) -> dict:
    """
    Aggregate social impact for all purchases containing food sold by this seller.
    """
    foods_res = supabase_admin.table("Food").select("foodID").eq("userID", seller_id).execute()
    food_ids = [f["foodID"] for f in (foods_res.data or [])]
    if not food_ids:
        return {"totalCarbonOffset": 0.0, "totalRescuedKilos": 0.0, "totalPeopleFed": 0, "purchaseCount": 0}

    items_res = supabase_admin.table("PurchaseItems").select("purchaseID").in_("foodID", food_ids).execute()
    purchase_ids = list({i["purchaseID"] for i in (items_res.data or [])})
    if not purchase_ids:
        return {"totalCarbonOffset": 0.0, "totalRescuedKilos": 0.0, "totalPeopleFed": 0, "purchaseCount": 0}

    impact_res = supabase_admin.table("SocialImpact").select("carbonOffset, rescuedKilos, peopleFed").in_("purchaseID", purchase_ids).execute()
    rows = impact_res.data or []
    return {
        "totalCarbonOffset": sum(float(r.get("carbonOffset") or 0) for r in rows),
        "totalRescuedKilos": sum(float(r.get("rescuedKilos") or 0) for r in rows),
        "totalPeopleFed": sum(int(r.get("peopleFed") or 0) for r in rows),
        "purchaseCount": len(purchase_ids),
    }


def fetch_summary_by_user(user_id: str):
    """
    Fetch and aggregate social impact metrics for a specific user.
    """
    # Join path: SocialImpact -> Purchase -> filter by userID
    response = supabase_admin.table("SocialImpact") \
        .select("*, Purchase!inner(userID)") \
        .eq("Purchase.userID", user_id) \
        .execute()
    
    rows = response.data
    summary = {
        "totalCarbonOffset": sum(row["carbonOffset"] for row in rows),
        "totalRescuedKilos": sum(row["rescuedKilos"] for row in rows),
        "totalPeopleFed": sum(row["peopleFed"] for row in rows),
        "purchaseCount": len(rows)
    }
    return summary
