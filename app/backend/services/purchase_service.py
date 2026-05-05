from database import supabase
from services import social_impact_service

def complete_purchase(purchase_id: str):
    """
    Mark a purchase as completed and trigger social impact calculation.
    """
    response = supabase.table("Purchase") \
        .update({"status": "completed"}) \
        .eq("purchaseID", purchase_id) \
        .execute()
    
    if response.data:
        # Hook into Social Impact
        social_impact_service.create_impact(purchase_id)
    
    return response

# TODO: Implement other purchase operations (fetch, cancel, etc.)
