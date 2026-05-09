from fastapi import APIRouter, Depends, HTTPException, Query, Body
from typing import Optional, List
from uuid import UUID

from database import supabase_admin
from api.dependency import require_role

router = APIRouter()


# ── Dashboard stats ──────────────────────────────────────────────────────────

@router.get("/stats")
async def get_admin_stats(current_user: dict = Depends(require_role("admin"))):
    """Aggregate counts for the admin dashboard home."""
    users_res = supabase_admin.table("User").select("userID, role").execute()
    users = users_res.data or []

    sellers   = sum(1 for u in users if u.get("role") == "seller")
    buyers    = sum(1 for u in users if u.get("role") == "buyer")
    charities = sum(1 for u in users if u.get("role") == "charity")

    pending_res = (
        supabase_admin.table("CharityApplication")
        .select("applicationID")
        .eq("status", "pending")
        .execute()
    )
    pending = len(pending_res.data or [])

    products_res = supabase_admin.table("Food").select("foodID").execute()
    products = len(products_res.data or [])

    return {
        "totalUsers":          len(users),
        "totalSellers":        sellers,
        "totalBuyers":         buyers,
        "totalCharities":      charities,
        "pendingApplications": pending,
        "totalProducts":       products,
    }


# ── User management ───────────────────────────────────────────────────────────

@router.get("/users")
async def list_users(
    role:  Optional[str] = None,
    page:  int = Query(default=1,  ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    current_user: dict = Depends(require_role("admin")),
):
    """Paginated list of all users, optionally filtered by role."""
    offset = (page - 1) * limit

    q = supabase_admin.table("User").select(
        "userID, firstName, lastName, emailAddress, role, barangay, city, created_at"
    )
    cq = supabase_admin.table("User").select("userID", count="exact")

    if role:
        q  = q.eq("role", role)
        cq = cq.eq("role", role)

    data  = q.range(offset, offset + limit - 1).order("created_at", desc=True).execute()
    count = cq.execute()

    return {
        "users": data.data or [],
        "total": count.count or 0,
        "page":  page,
        "limit": limit,
    }


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: UUID,
    role: str = Body(..., embed=True),
    current_user: dict = Depends(require_role("admin")),
):
    """Change a user's role."""
    allowed = {"buyer", "seller", "charity", "admin"}
    if role not in allowed:
        raise HTTPException(status_code=400, detail=f"Role must be one of: {allowed}")

    res = supabase_admin.table("User").update({"role": role}).eq("userID", str(user_id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": f"Role updated to {role}"}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: UUID,
    current_user: dict = Depends(require_role("admin")),
):
    """Delete a user account."""
    res = supabase_admin.table("User").delete().eq("userID", str(user_id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User deleted"}


# ── Pending approvals (charity applications) ─────────────────────────────────

@router.get("/pending-approvals")
async def get_pending_approvals(current_user: dict = Depends(require_role("admin"))):
    """List all pending charity / seller applications."""
    res = (
        supabase_admin.table("CharityApplication")
        .select("applicationID, organizationName, applicationType, status, submittedAt")
        .eq("status", "pending")
        .execute()
    )
    return res.data or []


# ── Partner / seller management ───────────────────────────────────────────────

@router.get("/sellers")
async def list_sellers(current_user: dict = Depends(require_role("admin"))):
    """List all sellers with their basic user info."""
    sellers_res = supabase_admin.table("Seller").select(
        "userID, sellerType, isVerified, companyName"
    ).execute()
    sellers = sellers_res.data or []

    if not sellers:
        return []

    user_ids = [s["userID"] for s in sellers]
    users_res = supabase_admin.table("User").select(
        "userID, firstName, lastName, emailAddress, barangay, city"
    ).in_("userID", user_ids).execute()

    user_map = {u["userID"]: u for u in (users_res.data or [])}

    return [
        {**s, "user": user_map.get(s["userID"], {})}
        for s in sellers
    ]


@router.patch("/sellers/{seller_id}/tags")
async def update_seller_tags(
    seller_id: UUID,
    tags: List[str] = Body(...),
    current_user: dict = Depends(require_role("admin")),
):
    """
    Update a seller's category tags.
    Requires a 'tags' text[] column on the Seller table.
    Run migration:  ALTER TABLE "Seller" ADD COLUMN tags text[] DEFAULT '{}';
    """
    res = (
        supabase_admin.table("Seller")
        .update({"tags": tags})
        .eq("userID", str(seller_id))
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Seller not found")

    return {"message": "Tags updated", "tags": tags}


# ── Reports ───────────────────────────────────────────────────────────────────

@router.get("/reports/transactions")
async def get_recent_transactions(
    limit: int = Query(default=10, ge=1, le=100),
    current_user: dict = Depends(require_role("admin")),
):
    """Recent purchases for the admin reports transaction log."""
    res = (
        supabase_admin.table("Purchase")
        .select("purchaseID, totalPrice, quantity, purchaseDate, status, userID, foodID")
        .order("purchaseDate", desc=True)
        .limit(limit)
        .execute()
    )
    return res.data or []
