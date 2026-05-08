"""
Service for handling charity applications.
"""
import logging

from database import supabase_admin

from uuid import UUID
from typing import Optional
from services import admin_activity_service
from services.notification_service import send_notification

logger = logging.getLogger(__name__)

def submit_application(user_id: str, data: dict):
    # Check for existing pending or approved application
    existing = supabase_admin.table("CharityApplication") \
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
    
    return supabase_admin.table("CharityApplication").insert(application_data).execute()

def fetch_application_by_user(user_id: str):
    return supabase_admin.table("CharityApplication") \
        .select("*") \
        .eq("userID", user_id) \
        .execute()

def fetch_all_pending():
    return supabase_admin.table("CharityApplication") \
        .select("*") \
        .eq("status", "pending") \
        .execute()

def review_application(application_id: str, status: str, org_name: Optional[str] = None, admin_id: Optional[str] = None):
    # 1. Fetch and validate the application before making any changes
    application_response = supabase_admin.table("CharityApplication") \
        .select("*") \
        .eq("applicationID", application_id) \
        .execute()
    
    if not application_response.data:
        raise Exception("Application not found.")

    application = application_response.data[0]
    if application["status"] != "pending":
        raise Exception("Only pending applications can be reviewed.")

    if status == "approved" and not org_name:
        raise Exception("Organization name is required for approval.")

    user_id = application["userID"]

    # 2. Update CharityApplication.status
    response = supabase_admin.table("CharityApplication") \
        .update({"status": status}) \
        .eq("applicationID", application_id) \
        .execute()
    
    if not response.data:
        raise Exception("Failed to update application status.")

    if status == "approved":
        # 3. Update User.role = 'charity'
        supabase_admin.table("User") \
            .update({"role": "charity"}) \
            .eq("userID", user_id) \
            .execute()

        # 4. Insert into Charity table
        supabase_admin.table("Charity") \
            .insert({"userID": user_id, "organizationName": org_name}) \
            .execute()

        # 5. Notify the user
        send_notification(
            user_id=user_id,
            title="Charity Application Approved!",
            message=f"Congratulations! Your application for {org_name} has been approved. You now have charity status.",
            type="system",
            link="/profile"
        )
    elif status == "rejected":
        # 3. Notify the user of rejection
        send_notification(
            user_id=user_id,
            title="Charity Application Update",
            message="We regret to inform you that your charity application has been rejected.",
            type="system",
            link="/profile"
        )

    # 6. Record admin activity (if admin_id provided)
    try:
        if admin_id:
            action = "approve" if status == "approved" else "reject"
            description = (
                f"CharityApplication {application_id} {action} by admin {admin_id}."
            )
            if status == "approved":
                description = (
                    f"CharityApplication {application_id} approved by admin {admin_id} for organization '{org_name}'."
                )

            admin_activity_service.record_admin_activity(
                admin_id=admin_id,
                action_type=action,
                description=description,
                target_id=application_id,
                target_entity="CharityApplication",
            )
    except Exception as e:
        # logging failure to write admin activity should not block the main flow
        logger.exception("Failed to record admin activity for charity application review: %s", e)

    return response
