from fastapi import APIRouter, Depends, HTTPException, Query, Body
from typing import Optional, List
from uuid import UUID

from database import supabase_admin
from api.dependency import require_role
from models.admin_reports import ReportsOverviewResponse, ReportsTransactionRow, ReportsTransactionsResponse
from models.admin_partner import SellerVerificationUpdateRequest, SellerVerificationUpdateResponse
from models.user import AdminCreateUserRequest, UpdateUserRoleRequest
from models.charity_post import CharityPostUpdate
from models.charity import CharityUpdate
from services import admin_reports_service, admin_activity_service, charity_post_service, charity_service, admin_partner_service
from services.auth_service import hash_password

router = APIRouter()


# ── Dashboard stats ──────────────────────────────────────────────────────────

@router.get("/stats")
async def get_admin_stats(current_user: dict = Depends(require_role("admin"))):
    """Aggregate counts for the admin dashboard home."""
    # Fetch data without silent exception masking to ensure errors are visible
    users_res = supabase_admin.table("User").select("userID, role").execute()
    users = users_res.data or []

    sellers = sum(1 for u in users if u.get("role") == "seller")
    buyers = sum(1 for u in users if u.get("role") == "buyer")
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


@router.get("/reports/overview", response_model=ReportsOverviewResponse)
async def get_reports_overview(current_user: dict = Depends(require_role("admin"))):
    return admin_reports_service.fetch_reports_overview()


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

    def _run_query(created_field: str):
        q = supabase_admin.table("User").select(
            f"userID, firstName, lastName, emailAddress, role, barangay, city, {created_field}"
        )
        cq = supabase_admin.table("User").select("userID", count="exact")

        if role:
            q = q.eq("role", role)
            cq = cq.eq("role", role)

        data = q.range(offset, offset + limit - 1).order(created_field, desc=True).execute()
        count = cq.execute()
        return data, count

    try:
        data, count = _run_query("createdAt")
    except Exception:
        data, count = _run_query("created_at")

    return {
        "users": data.data or [],
        "total": count.count or 0,
        "page":  page,
        "limit": limit,
    }


@router.post("/users", status_code=201)
async def create_admin_user(
    data: AdminCreateUserRequest,
    current_user: dict = Depends(require_role("admin")),
):
    """Create a new admin-role user directly from the admin panel."""
    existing = supabase_admin.table("User").select("emailAddress").eq("emailAddress", data.emailAddress).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered.")

    hashed = hash_password(data.password)
    user_res = supabase_admin.table("User").insert({
        "firstName": data.firstName,
        "lastName": data.lastName,
        "emailAddress": data.emailAddress,
        "password": hashed,
        "role": "admin",
        "phoneNumber": "",
        "street": "",
        "residentialName": "",
        "barangay": "",
        "city": "",
    }).execute()

    if not user_res.data:
        raise HTTPException(status_code=500, detail="Failed to create admin user.")

    new_user = user_res.data[0]
    new_user_id = new_user["userID"]

    # Ensure Admin record exists for the new admin (B-9 extension)
    try:
        supabase_admin.table("Admin").insert({
            "userID": new_user_id,
            "employeeID": f"EMP-{new_user_id[:8].upper()}", # Auto-generate a placeholder
            "adminType": "staff"
        }).execute()
    except Exception as e:
        print(f"Warning: Failed to create Admin record for new user: {e}")

    # Record activity (non-blocking - failure won't prevent response)
    try:
        admin_activity_service.record_admin_activity(
            admin_id=current_user["userID"],
            action_type="create_admin",
            description=f"Created admin account for {data.emailAddress}",
            target_id=new_user_id,
            target_entity="User",
        )
    except Exception as e:
        print(f"Warning: Failed to record admin activity: {e}")

    return {"message": "Admin user created.", "userID": new_user_id}


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: UUID,
    data: UpdateUserRoleRequest,
    current_user: dict = Depends(require_role("admin")),
):
    """Change a user's role. When promoting to admin, employeeID and adminType are required."""
    allowed = {"buyer", "seller", "charity", "admin", "rider"}
    if data.role not in allowed:
        raise HTTPException(status_code=400, detail=f"Role must be one of: {allowed}")

    # If promoting to admin, require employeeID and adminType
    if data.role == "admin":
        if not data.employeeID or not data.adminType:
            raise HTTPException(status_code=400, detail="employeeID and adminType are required when promoting to admin.")

    # Update user role
    res = supabase_admin.table("User").update({"role": data.role}).eq("userID", str(user_id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")

    user_id_str = str(user_id)

    # N-1: Ensure Charity record exists when role is "charity"
    # B-9: Enforce role exclusivity by cleaning up other role-specific records
    if data.role == "charity":
        existing_charity = supabase_admin.table("Charity").select("userID").eq("userID", user_id_str).execute()
        if not existing_charity.data:
            charity_res = supabase_admin.table("Charity").insert({
                "userID": user_id_str,
                "organizationName": "Unnamed Organization", # admin can edit later
            }).execute()
            if not charity_res.data:
                raise HTTPException(status_code=500, detail="Failed to create Charity record.")
        
        # Exclusivity: Remove from Seller and Admin (and potentially Buyer if required)
        supabase_admin.table("Seller").delete().eq("userID", user_id_str).execute()
        supabase_admin.table("Admin").delete().eq("userID", user_id_str).execute()
        # Note: Buyer record (points) is often kept as a base, but for strict exclusivity:
        # supabase_admin.table("Buyer").delete().eq("userID", user_id_str).execute()

    elif data.role == "seller":
        # Ensure Seller record exists
        existing_seller = supabase_admin.table("Seller").select("userID").eq("userID", user_id_str).execute()
        if not existing_seller.data:
            supabase_admin.table("Seller").insert({
                "userID": user_id_str,
                "companyName": "New Seller",
                "sellerType": "individual",
                "isVerified": False
            }).execute()
        
        # Exclusivity: Remove from Charity and Admin
        supabase_admin.table("Charity").delete().eq("userID", user_id_str).execute()
        supabase_admin.table("Admin").delete().eq("userID", user_id_str).execute()

    elif data.role == "admin":
        # Check if Admin record already exists
        existing_admin = supabase_admin.table("Admin").select("userID").eq("userID", user_id_str).execute()
        
        if not existing_admin.data:
            # Create new Admin record
            admin_res = supabase_admin.table("Admin").insert({
                "userID": user_id_str,
                "employeeID": data.employeeID,
                "adminType": data.adminType,
            }).execute()
            if not admin_res.data:
                raise HTTPException(status_code=500, detail="Failed to create admin record.")
        else:
            # Update existing Admin record
            update_res = supabase_admin.table("Admin").update({
                "employeeID": data.employeeID,
                "adminType": data.adminType,
            }).eq("userID", user_id_str).execute()
            if not update_res.data:
                raise HTTPException(status_code=500, detail="Failed to update admin record.")
        
        # Exclusivity: Remove from Charity and Seller
        supabase_admin.table("Charity").delete().eq("userID", user_id_str).execute()
        supabase_admin.table("Seller").delete().eq("userID", user_id_str).execute()

    else:
        # Default (buyer or other): Clean up all exclusive role records
        supabase_admin.table("Admin").delete().eq("userID", user_id_str).execute()
        supabase_admin.table("Charity").delete().eq("userID", user_id_str).execute()
        supabase_admin.table("Seller").delete().eq("userID", user_id_str).execute()

    # Record activity (non-blocking - failure won't prevent response)
    try:
        admin_activity_service.record_admin_activity(
            admin_id=current_user["userID"],
            action_type="update_role",
            description=f"Changed user role to '{data.role}'",
            target_id=user_id_str,
            target_entity="User",
        )
    except Exception as e:
        print(f"Warning: Failed to record admin activity: {e}")

    return {"message": f"Role updated to {data.role}"}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: UUID,
    current_user: dict = Depends(require_role("admin")),
):
    """Delete a user account."""
    res = supabase_admin.table("User").delete().eq("userID", str(user_id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")

    # Record activity (non-blocking - failure won't prevent response)
    try:
        admin_activity_service.record_admin_activity(
            admin_id=current_user["userID"],
            action_type="delete_user",
            description="Deleted user account",
            target_id=str(user_id),
            target_entity="User",
        )
    except Exception as e:
        print(f"Warning: Failed to record admin activity: {e}")

    return {"message": "User deleted"}


# ── Pending approvals (charity applications) ─────────────────────────────────

@router.get("/pending-approvals")
async def get_pending_approvals(current_user: dict = Depends(require_role("admin"))):
    """List all pending charity / seller applications."""
    res = (
        supabase_admin.table("CharityApplication")
        .select("applicationID, userID, status")
        .eq("status", "pending")
        .execute()
    )
    return res.data or []


# ── Partner / seller management ───────────────────────────────────────────────

@router.get("/charities")
async def list_charities(current_user: dict = Depends(require_role("admin"))):
    """List all approved charities."""
    res = supabase_admin.table("Charity").select("*, User(firstName, lastName, emailAddress)").execute()
    return res.data or []

@router.put("/charities/{user_id}/partner")
async def toggle_charity_partner(
    user_id: UUID,
    isPartner: bool = Body(..., embed=True),
    current_user: dict = Depends(require_role("admin")),
):
    """Toggle a charity's partner status."""
    res = supabase_admin.table("Charity").update({"isPartner": isPartner}).eq("userID", str(user_id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Charity not found")

    try:
        admin_activity_service.record_admin_activity(
            admin_id=current_user["userID"],
            action_type="toggle_partner_status",
            description=f"Set partner status to {isPartner} for charity {user_id}",
            target_id=str(user_id),
            target_entity="Charity",
        )
    except Exception as e:
        print(f"Warning: Failed to record admin activity: {e}")

    return {"message": f"Partner status updated to {isPartner}", "isPartner": isPartner}

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

    # Record activity (non-blocking - failure won't prevent response)
    try:
        admin_activity_service.record_admin_activity(
            admin_id=current_user["userID"],
            action_type="update_tags",
            description=f"Updated seller tags: {', '.join(tags) if tags else 'cleared'}",
            target_id=str(seller_id),
            target_entity="Seller",
        )
    except Exception as e:
        print(f"Warning: Failed to record admin activity: {e}")

    return {"message": "Tags updated", "tags": tags}


@router.put("/sellers/{seller_id}/verification", response_model=SellerVerificationUpdateResponse)
async def update_seller_verification(
    seller_id: UUID,
    payload: SellerVerificationUpdateRequest,
    current_user: dict = Depends(require_role("admin")),
):
    updated_seller = admin_partner_service.update_seller_verification(
        seller_id=str(seller_id),
        is_verified=payload.isVerified,
    )
    if not updated_seller:
        raise HTTPException(status_code=404, detail="Seller not found")

    try:
        admin_activity_service.record_admin_activity(
            admin_id=current_user["userID"],
            action_type="verify_seller" if payload.isVerified else "unverify_seller",
            description=f"{'Verified' if payload.isVerified else 'Unverified'} seller account",
            target_id=str(seller_id),
            target_entity="Seller",
        )
    except Exception as e:
        print(f"Warning: Failed to record admin activity: {e}")

    return {
        "message": "Seller verification updated",
        "userID": str(seller_id),
        "isVerified": payload.isVerified,
    }


# ── Reports ───────────────────────────────────────────────────────────────────

@router.get("/reports/transactions", response_model=ReportsTransactionsResponse)
async def get_recent_transactions(
    limit: int = Query(default=10, ge=1, le=100),
    page: int = Query(default=1, ge=1),
    current_user: dict = Depends(require_role("admin")),
):
    """Recent purchases for the admin reports transaction log."""
    return admin_reports_service.fetch_recent_transactions(limit=limit, page=page)


@router.get("/reports/bad-actors")
async def get_bad_actor_report(
    limit: int = Query(default=10, ge=1, le=100),
    current_user: dict = Depends(require_role("admin")),
):
    """
    Reports endpoint focused on risky/low-rated sellers.
    Used by the admin Reports page to surface "bad actors" without enforcing deactivation.
    """
    ratings_res = (
        supabase_admin.table("Rating")
        .select("ratingID, sellerID, rating, comment, createdAt, purchaseID")
        .order("createdAt", desc=True)
        .execute()
    )
    ratings = ratings_res.data or []

    seller_ids = list({r.get("sellerID") for r in ratings if r.get("sellerID")})
    seller_rows = []
    user_rows = []
    if seller_ids:
        seller_rows = (
            supabase_admin.table("Seller")
            .select("userID, companyName")
            .in_("userID", seller_ids)
            .execute()
            .data
            or []
        )
        user_rows = (
            supabase_admin.table("User")
            .select("userID, firstName, lastName, emailAddress, barangay, city")
            .in_("userID", seller_ids)
            .execute()
            .data
            or []
        )

    seller_map = {s.get("userID"): s for s in seller_rows}
    user_map = {u.get("userID"): u for u in user_rows}

    grouped: dict[str, list[dict]] = {}
    for row in ratings:
        sid = row.get("sellerID")
        if not sid:
            continue
        grouped.setdefault(sid, []).append(row)

    bad_actors = []
    for sid, rows in grouped.items():
        ordered = sorted(rows, key=lambda r: r.get("createdAt") or "", reverse=True)
        total_reviews = len(ordered)
        low_reviews = sum(1 for r in ordered if int(r.get("rating") or 0) <= 2)
        avg_rating = (
            sum(float(r.get("rating") or 0) for r in ordered) / total_reviews
            if total_reviews
            else 0.0
        )

        consecutive_low = 0
        for r in ordered:
            if int(r.get("rating") or 0) <= 2:
                consecutive_low += 1
            else:
                break

        latest = ordered[0] if ordered else {}
        seller = seller_map.get(sid, {})
        user = user_map.get(sid, {})
        display_name = seller.get("companyName") or f"{(user.get('firstName') or '').strip()} {(user.get('lastName') or '').strip()}".strip() or "Unknown Seller"

        bad_actors.append(
            {
                "userID": sid,
                "name": display_name,
                "emailAddress": user.get("emailAddress"),
                "barangay": user.get("barangay"),
                "city": user.get("city"),
                "totalReviews": total_reviews,
                "lowRatings": low_reviews,
                "averageRating": round(avg_rating, 2),
                "consecutiveLowReviews": consecutive_low,
                "latestRating": int(latest.get("rating") or 0),
                "latestComment": latest.get("comment"),
                "latestAt": latest.get("createdAt"),
            }
        )

    bad_actors.sort(
        key=lambda x: (
            -int(x.get("consecutiveLowReviews") or 0),
            -int(x.get("lowRatings") or 0),
            float(x.get("averageRating") or 0),
        )
    )

    total_reviews_all = len(ratings)
    low_reviews_all = sum(1 for r in ratings if int(r.get("rating") or 0) <= 2)
    flagged = [a for a in bad_actors if int(a.get("lowRatings") or 0) > 0]
    recent_incidents = []
    for r in ratings:
        if int(r.get("rating") or 0) > 2:
            continue
        sid = r.get("sellerID")
        user = user_map.get(sid, {})
        seller = seller_map.get(sid, {})
        name = seller.get("companyName") or f"{(user.get('firstName') or '').strip()} {(user.get('lastName') or '').strip()}".strip() or "Unknown Seller"
        recent_incidents.append(
            {
                "ratingID": r.get("ratingID"),
                "sellerID": sid,
                "sellerName": name,
                "rating": int(r.get("rating") or 0),
                "comment": r.get("comment"),
                "createdAt": r.get("createdAt"),
                "purchaseID": r.get("purchaseID"),
            }
        )
        if len(recent_incidents) >= limit:
            break

    return {
        "summary": {
            "totalReviews": total_reviews_all,
            "lowRatings": low_reviews_all,
            "flaggedSellers": len(flagged),
            "watchlistSellers": sum(1 for a in bad_actors if int(a.get("consecutiveLowReviews") or 0) >= 2),
        },
        "badActors": bad_actors[:limit],
        "recentIncidents": recent_incidents,
    }


# ── Charity & Post Management (Admin) ──────────────────────────────────────────

# Full edit of any charity post (bypasses ownership check)
@router.put("/charity-posts/{charity_id}")
async def admin_update_charity_post(
    charity_id: UUID, 
    data: CharityPostUpdate, 
    current_user: dict = Depends(require_role("admin"))
):
    response = charity_post_service.update_post(str(charity_id), data.model_dump(exclude_unset=True))
    if not response.data:
        raise HTTPException(status_code=404, detail="Charity post not found")
        
    admin_activity_service.record_admin_activity(
        admin_id=current_user["userID"],
        action_type="edit_charity_post",
        description=f"Edited charity post {charity_id}",
        target_id=str(charity_id),
        target_entity="CharityPost",
    )
    return response.data[0]

# Delete any charity post (bypasses ownership check)
@router.delete("/charity-posts/{charity_id}")
async def admin_delete_charity_post(
    charity_id: UUID, 
    current_user: dict = Depends(require_role("admin"))
):
    response = charity_post_service.delete_post(str(charity_id))
    if not response.data:
        raise HTTPException(status_code=404, detail="Charity post not found")

    admin_activity_service.record_admin_activity(
        admin_id=current_user["userID"],
        action_type="delete_charity_post",
        description=f"Deleted charity post {charity_id}",
        target_id=str(charity_id),
        target_entity="CharityPost",
    )
    return {"message": "Charity post deleted"}

# Edit a charity's organizationName
@router.put("/charities/{user_id}")
async def admin_update_charity(
    user_id: UUID, 
    data: CharityUpdate, 
    current_user: dict = Depends(require_role("admin"))
):
    response = charity_service.update_charity(str(user_id), data.model_dump(exclude_unset=True))
    if not response.data:
        raise HTTPException(status_code=404, detail="Charity not found")
        
    admin_activity_service.record_admin_activity(
        admin_id=current_user["userID"],
        action_type="edit_charity",
        description=f"Edited charity organization {user_id}",
        target_id=str(user_id),
        target_entity="Charity",
    )
    return response.data[0]

# Remove a charity organization record (does not delete the User account)
@router.delete("/charities/{user_id}")
async def admin_delete_charity(
    user_id: UUID, 
    current_user: dict = Depends(require_role("admin"))
):
    res = supabase_admin.table("Charity").delete().eq("userID", str(user_id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Charity not found")

    admin_activity_service.record_admin_activity(
        admin_id=current_user["userID"],
        action_type="delete_charity",
        description=f"Removed charity organization record for user {user_id}",
        target_id=str(user_id),
        target_entity="Charity",
    )
    return {"message": "Charity organization removed"}
