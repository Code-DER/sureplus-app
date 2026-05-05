"""
Service for handling charity applications.
"""
from database import supabase

from uuid import UUID
from typing import Optional
from services.notification_service import send_notification

def submit_application(user_id: str, data: dict):
    # Check for existing pending or approved application
    existing = supabase.table("CharityApplication") \
        .select("*") \
        .eq("userID", user_id) \
        .in_("status", ["pending", "approved"]) \
        .execute()
    
    if existing.data:
        raise Exception("A pending or approved application already exists for this user.")

    application_data = {
        "userID": user_id,
        "purpose": data.get("purpose"),
        "govID": data.get("govID"),
        "status": "pending"
    }
    
    return supabase.table("CharityApplication").insert(application_data).execute()

def fetch_application_by_user(user_id: str):
    return supabase.table("CharityApplication") \
        .select("*") \
        .eq("userID", user_id) \
        .execute()

def fetch_all_pending():
    return supabase.table("CharityApplication") \
        .select("*") \
        .eq("status", "pending") \
        .execute()

def review_application(application_id: str, status: str, org_name: Optional[str] = None):
    # 1. Update CharityApplication.status
    response = supabase.table("CharityApplication") \
        .update({"status": status}) \
        .eq("applicationID", application_id) \
        .execute()
    
    if not response.data:
        raise Exception("Application not found.")

    application = response.data[0]
    user_id = application["userID"]

    if status == "approved":
        if not org_name:
            raise Exception("Organization name is required for approval.")

        # 2. Update User.role = 'charity'
        supabase.table("User") \
            .update({"role": "charity"}) \
            .eq("userID", user_id) \
            .execute()

        # 3. Insert into Charity table
        supabase.table("Charity") \
            .insert({"userID": user_id, "organizationName": org_name}) \
            .execute()

        # 4. Notify the user
        send_notification(
            user_id=user_id,
            title="Charity Application Approved!",
            message=f"Congratulations! Your application for {org_name} has been approved. You now have charity status.",
            type="system",
            link="/profile"
        )
    elif status == "rejected":
        # Notify the user of rejection
        send_notification(
            user_id=user_id,
            title="Charity Application Update",
            message="We regret to inform you that your charity application has been rejected.",
            type="system",
            link="/profile"
        )

    return response
