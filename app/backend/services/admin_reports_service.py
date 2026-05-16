from database import supabase_admin


def fetch_reports_overview() -> dict:
    """
    Basic accounting + inventory distribution derived from current schema.
    """
    completed_purchases = (
        supabase_admin.table("Purchase")
        .select("purchaseID, totalPrice, status")
        .eq("status", "completed")
        .execute()
    )
    purchases = completed_purchases.data or []
    purchase_ids = [p["purchaseID"] for p in purchases]

    gross_sales = sum(float(p.get("totalPrice") or 0) for p in purchases)
    platform_markup_rate = 0.15
    platform_earnings = gross_sales * platform_markup_rate
    subscription_fees = 0.0

    sold_quantity = 0
    if purchase_ids:
        items_res = (
            supabase_admin.table("PurchaseItems")
            .select("quantity")
            .in_("purchaseID", purchase_ids)
            .execute()
        )
        sold_quantity = sum(int(i.get("quantity") or 0) for i in (items_res.data or []))

    return {
        "accounting": {
            "grossSales": gross_sales,
            "platformMarkupRate": platform_markup_rate,
            "platformEarnings": platform_earnings,
            "subscriptionFees": subscription_fees,
            "totalEarnings": platform_earnings + subscription_fees,
        },
        "inventory": {
            "sold": sold_quantity,
            "donated": 0,
            "innovator": 0,
            "composted": 0,
        },
        "notes": [
            "donated/innovator/composted are 0 because DB schema has no explicit lifecycle/status fields for these categories",
            "subscriptionFees are 0 because DB schema has no subscription billing table",
        ],
    }


def fetch_recent_transactions(limit: int) -> list[dict]:
    rows = []
    try:
        res = (
            supabase_admin.table("Purchase")
            .select("purchaseID, totalPrice, purchaseDate, status, userID")
            .order("purchaseDate", desc=True)
            .limit(limit)
            .execute()
        )
        rows = res.data or []
    except Exception:
        try:
            res = (
                supabase_admin.table("Purchase")
                .select("purchaseID, totalPrice, status, userID, createdAt")
                .order("createdAt", desc=True)
                .limit(limit)
                .execute()
            )
            rows = [{**row, "purchaseDate": row.get("createdAt")} for row in (res.data or [])]
        except Exception:
            rows = []

    normalized_rows = [
        {
            **row,
            "quantity": row.get("quantity", 0),
            "foodID": row.get("foodID"),
        }
        for row in rows
    ]

    purchase_ids = [row.get("purchaseID") for row in normalized_rows if row.get("purchaseID")]
    quantities_by_purchase: dict[str, int] = {}
    if purchase_ids:
        try:
            items_res = (
                supabase_admin.table("PurchaseItems")
                .select("purchaseID, quantity")
                .in_("purchaseID", purchase_ids)
                .execute()
            )
            for item in (items_res.data or []):
                pid = item.get("purchaseID")
                if not pid:
                    continue
                quantities_by_purchase[pid] = quantities_by_purchase.get(pid, 0) + int(item.get("quantity") or 0)
        except Exception:
            quantities_by_purchase = {}

    for row in normalized_rows:
        pid = row.get("purchaseID")
        if pid in quantities_by_purchase:
            row["quantity"] = quantities_by_purchase[pid]

    return normalized_rows
