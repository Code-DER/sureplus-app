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

def create_food_donation_impact(donation_id: str, rescued_kg: float):
    """
    Create a social impact record for a food donation.
    """
    carbon_offset = rescued_kg * CO2_PER_KG
    people_fed = math.floor(rescued_kg / KG_PER_MEAL)
    return supabase_admin.table("SocialImpact").insert({
        "donationID": donation_id,
        "carbonOffset": carbon_offset,
        "rescuedKilos": rescued_kg,
        "peopleFed": people_fed,
    }).execute()

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
    Fetch and aggregate social impact metrics for a specific user (purchases + donations).
    """
    # 1. Purchase-based impact
    purchase_res = supabase_admin.table("Purchase") \
        .select("purchaseID") \
        .eq("userID", user_id) \
        .execute()
    purchase_ids = [r["purchaseID"] for r in (purchase_res.data or [])]
    
    purchase_impact = []
    if purchase_ids:
        pi_res = supabase_admin.table("SocialImpact") \
            .select("*").in_("purchaseID", purchase_ids).execute()
        purchase_impact = pi_res.data

    # 2. Donation-based impact
    donation_res = supabase_admin.table("Donation") \
        .select("donationID") \
        .eq("userID", user_id) \
        .eq("donationType", "food") \
        .execute()
    donation_ids = [r["donationID"] for r in (donation_res.data or [])]
    
    donation_impact = []
    if donation_ids:
        di_res = supabase_admin.table("SocialImpact") \
            .select("*").in_("donationID", donation_ids).execute()
        donation_impact = di_res.data

    all_rows = purchase_impact + donation_impact
    
    return {
        "totalCarbonOffset": sum(float(row.get("carbonOffset") or 0) for row in all_rows),
        "totalRescuedKilos": sum(float(row.get("rescuedKilos") or 0) for row in all_rows),
        "totalPeopleFed": sum(int(row.get("peopleFed") or 0) for row in all_rows),
        "purchaseCount": len(purchase_ids),
        "donationCount": len(donation_ids)
    }

def fetch_impact_by_donation(donation_id: str):
    """
    Fetch the social impact record for a specific donation.
    """
    return supabase_admin.table("SocialImpact")         .select("*")         .eq("donationID", donation_id)         .single()         .execute()

def fetch_global_impact():
    """
    Fetch and aggregate platform-wide social impact metrics.
    """
    res = supabase_admin.table("SocialImpact") \
        .select("carbonOffset, rescuedKilos, peopleFed").execute()
    rows = res.data or []
    return {
        "totalCarbonOffset": sum(float(r.get("carbonOffset") or 0) for r in rows),
        "totalRescuedKilos": sum(float(r.get("rescuedKilos") or 0) for r in rows),
        "totalPeopleFed":    sum(int(r.get("peopleFed") or 0) for r in rows),
        "totalEvents":       len(rows),
    }

def fetch_impact_history(user_id: str):
    """
    Fetch historical timeline of impact events for a user.
    Joins SocialImpact with Purchase and Donation.
    """
    # 1. Purchase-based impacts
    purchase_res = supabase_admin.table("Purchase") \
        .select("purchaseID") \
        .eq("userID", user_id) \
        .execute()
    purchase_ids = [r["purchaseID"] for r in (purchase_res.data or [])]
    
    p_impact_data = []
    if purchase_ids:
        p_res = supabase_admin.table("SocialImpact") \
            .select("*, Purchase!inner(purchaseDate)") \
            .in_("purchaseID", purchase_ids) \
            .execute()
        p_impact_data = p_res.data
    
    # 2. Donation-based impacts
    donation_res = supabase_admin.table("Donation") \
        .select("donationID") \
        .eq("userID", user_id) \
        .execute()
    donation_ids = [r["donationID"] for r in (donation_res.data or [])]
    
    d_impact_data = []
    if donation_ids:
        d_res = supabase_admin.table("SocialImpact") \
            .select("*, Donation!inner(createdAt, CharityPost(title))") \
            .in_("donationID", donation_ids) \
            .execute()
        d_impact_data = d_res.data
    
    history = []
    
    for row in p_impact_data:
        history.append({
            "id": row["impactID"],
            "type": "purchase",
            "date": row["Purchase"]["purchaseDate"],
            "rescuedKilos": row["rescuedKilos"],
            "carbonOffset": row["carbonOffset"],
            "peopleFed": row["peopleFed"],
            "description": "Marketplace Purchase"
        })
        
    for row in d_impact_data:
        history.append({
            "id": row["impactID"],
            "type": "donation",
            "date": row["Donation"]["createdAt"],
            "rescuedKilos": row["rescuedKilos"],
            "carbonOffset": row["carbonOffset"],
            "peopleFed": row["peopleFed"],
            "description": f"Donation to {row['Donation']['CharityPost']['title']}"
        })
        
    # Sort by date DESC
    history.sort(key=lambda x: x["date"], reverse=True)
    
    return history
