"""
Service for handling admin activity audit logs.
"""
from typing import Optional

from database import supabase_admin


def fetch_admin_activities(
    action_type: Optional[str] = None,
    target_entity: Optional[str] = None,
    admin_id: Optional[str] = None,
    limit: int = 100,
):
    query = supabase_admin.table("AdminActivity").select("*").order("timestamp", desc=True).limit(limit)

    if action_type:
        query = query.eq("actionType", action_type)
    if target_entity:
        query = query.eq("targetEntity", target_entity)
    if admin_id:
        query = query.eq("userID", admin_id)

    return query.execute()


def record_admin_activity(
    admin_id: str,
    action_type: str,
    description: str,
    target_id: Optional[str] = None,
    target_entity: Optional[str] = None,
):
    admin_activity = {
        "userID": admin_id,
        "actionType": action_type,
        "description": description,
        "targetID": target_id,
        "targetEntity": target_entity,
    }

    return supabase_admin.table("AdminActivity").insert(admin_activity).execute()
