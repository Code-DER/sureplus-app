import math
from database import supabase

CO2_PER_KG  = 2.5   # kg CO2 equivalent per kg food waste avoided (FAO)
KG_PER_MEAL = 0.5   # kg of food per meal

def compute_metrics(purchase_id: str) -> dict:
    """
    Compute social impact metrics for a given purchase.
    Fetches PurchaseItems joined with Food to get real weightKg.
    """
    # Fetch all PurchaseItems for the purchase joined with Food
    response = supabase.table("PurchaseItems") \
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
    return supabase.table("SocialImpact").insert(metrics).execute()

def fetch_impact_by_purchase(purchase_id: str):
    """
    Fetch the social impact record for a specific purchase.
    """
    return supabase.table("SocialImpact") \
        .select("*") \
        .eq("purchaseID", purchase_id) \
        .single() \
        .execute()

def fetch_summary_by_user(user_id: str):
    """
    Fetch and aggregate social impact metrics for a specific user.
    """
    # Join path: SocialImpact -> Purchase -> filter by userID
    response = supabase.table("SocialImpact") \
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
