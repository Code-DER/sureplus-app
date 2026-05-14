# TODO — Charity / CharityPost / SocialImpact

> Scope: `app/backend/api/charities.py`, `charity_posts.py`, `social_impact.py`,
> `app/backend/services/charity_*.py`, `social_impact_service.py`,
> `app/backend/models/charity*.py`, `social_impact.py`,
> `app/frontend/src/components/CharityDashboard.tsx`, `CharityPostCard.tsx`,
> `CharityPostsFeed.tsx`, `CharityProfileView.tsx`, `DonateModal.tsx`, `SocialImpactView.tsx`,
> `app/supabase/migrations/*`

---

## 🟢 FEATURE — Money & Food Donations

Charities should be able to accept **monetary donations**, **food donations** (linked to
actual marketplace `Food` listings), or **both** on a single post. This is a cross-cutting
change — it affects the DB schema, every backend layer, and the frontend UI. Do this
**after** all 🔴 bugs are resolved, and **before** finalising L-1, L-2, and L-3 below
since this feature changes the shape of all three.

---

### FD-1 · DB — Add donation mode + food goal tracking to `CharityPost`

**New migration:**

```sql
ALTER TABLE "CharityPost"
  ADD COLUMN "donationMode"   TEXT          NOT NULL DEFAULT 'money'
    CHECK ("donationMode" IN ('money', 'food', 'both')),
  ADD COLUMN "foodGoalKg"     NUMERIC(10,3) CHECK ("foodGoalKg" > 0),
  ADD COLUMN "currentFoodKg"  NUMERIC(10,3) NOT NULL DEFAULT 0;

-- Enforce: money posts must have amountNeeded, food posts must have foodGoalKg
ALTER TABLE "CharityPost" ADD CONSTRAINT ck_charitypost_goals CHECK (
  (  "donationMode" = 'money' AND "amountNeeded" IS NOT NULL                         )
  OR ("donationMode" = 'food'  AND "foodGoalKg"   IS NOT NULL                         )
  OR ("donationMode" = 'both'  AND "amountNeeded" IS NOT NULL AND "foodGoalKg" IS NOT NULL)
);
```

Because `amountNeeded` is currently `NOT NULL` in the schema, it needs to become
nullable so food-only posts don't need to supply it:

```sql
ALTER TABLE "CharityPost" ALTER COLUMN "amountNeeded" DROP NOT NULL;
```

---

### FD-2 · DB — `Donation` table must support both donation types

This replaces the simpler design in **L-1**. The `Donation` table needs to be a
discriminated record — one row = one donation event, and its type determines which
fields are populated.

```sql
CREATE TABLE "Donation" (
  "donationID"   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  "postID"       UUID          NOT NULL REFERENCES "CharityPost"("charityID") ON DELETE CASCADE,
  "userID"       UUID          REFERENCES "User"("userID") ON DELETE SET NULL,
  "donationType" TEXT          NOT NULL CHECK ("donationType" IN ('money', 'food')),

  -- Money fields (populated when donationType = 'money')
  "amount"       NUMERIC(12,2) CHECK ("amount" > 0),

  -- Food fields (populated when donationType = 'food')
  "foodID"       UUID          REFERENCES "Food"("foodID") ON DELETE SET NULL,
  "quantity"     INT           CHECK ("quantity" > 0),
  "foodKg"       NUMERIC(10,3) CHECK ("foodKg" >= 0),  -- quantity * Food.weightKg, denormalised for history

  "createdAt"    TIMESTAMPTZ   DEFAULT now(),

  -- Exactly one type's fields must be populated
  CONSTRAINT ck_donation_type CHECK (
    ("donationType" = 'money' AND "amount"   IS NOT NULL AND "foodID"   IS NULL AND "quantity" IS NULL)
    OR
    ("donationType" = 'food'  AND "foodID"   IS NOT NULL AND "quantity" IS NOT NULL AND "amount" IS NULL)
  )
);

ALTER TABLE "Donation" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donors can view their own donations"
  ON "Donation" FOR SELECT USING (auth.uid() = "userID");
CREATE POLICY "Charities can view donations to their posts"
  ON "Donation" FOR SELECT USING (
    auth.uid() IN (SELECT "userID" FROM "CharityPost" WHERE "charityID" = "Donation"."postID")
  );
```

---

### FD-3 · DB — Two atomic RPCs: one for money, one for food

**Money RPC** (update of the existing `increment_charity_amount` — see also L-2):

```sql
CREATE OR REPLACE FUNCTION donate_money_to_post(p_post_id UUID, p_amount NUMERIC)
RETURNS SETOF "CharityPost" LANGUAGE plpgsql AS $$
DECLARE rec "CharityPost"%ROWTYPE;
BEGIN
  IF p_amount <= 0 THEN RAISE EXCEPTION 'Amount must be greater than zero'; END IF;
  SELECT * INTO rec FROM "CharityPost" WHERE "charityID" = p_post_id FOR UPDATE;
  IF rec."donationMode" NOT IN ('money', 'both') THEN
    RAISE EXCEPTION 'This campaign does not accept monetary donations';
  END IF;
  IF rec."currentAmount" >= rec."amountNeeded" THEN
    RAISE EXCEPTION 'Money goal already reached';
  END IF;
  RETURN QUERY UPDATE "CharityPost"
    SET "currentAmount" = LEAST("currentAmount" + p_amount, "amountNeeded")
    WHERE "charityID" = p_post_id RETURNING *;
END; $$;
```

**Food RPC (new):**

```sql
CREATE OR REPLACE FUNCTION donate_food_to_post(p_post_id UUID, p_food_id UUID, p_quantity INT)
RETURNS SETOF "CharityPost" LANGUAGE plpgsql AS $$
DECLARE
  rec      "CharityPost"%ROWTYPE;
  food_row "Food"%ROWTYPE;
  kg_added NUMERIC;
BEGIN
  IF p_quantity <= 0 THEN RAISE EXCEPTION 'Quantity must be greater than zero'; END IF;
  SELECT * INTO rec FROM "CharityPost" WHERE "charityID" = p_post_id FOR UPDATE;
  IF rec."donationMode" NOT IN ('food', 'both') THEN
    RAISE EXCEPTION 'This campaign does not accept food donations';
  END IF;
  IF rec."currentFoodKg" >= rec."foodGoalKg" THEN
    RAISE EXCEPTION 'Food goal already reached';
  END IF;

  -- Decrement stock atomically
  SELECT * INTO food_row FROM "Food" WHERE "foodID" = p_food_id FOR UPDATE;
  IF food_row."stockQuantity" < p_quantity THEN
    RAISE EXCEPTION 'Not enough stock for this food item';
  END IF;
  UPDATE "Food" SET "stockQuantity" = "stockQuantity" - p_quantity WHERE "foodID" = p_food_id;

  kg_added := LEAST(
    p_quantity * food_row."weightKg",
    rec."foodGoalKg" - rec."currentFoodKg"
  );
  RETURN QUERY UPDATE "CharityPost"
    SET "currentFoodKg" = "currentFoodKg" + kg_added
    WHERE "charityID" = p_post_id RETURNING *;
END; $$;
```

---

### FD-4 · Backend models — Update `CharityPost` models

**File:** `app/backend/models/charity_post.py`

```python
from typing import Literal, Optional
from pydantic import BaseModel, Field, model_validator
from uuid import UUID
from datetime import datetime

DonationMode = Literal['money', 'food', 'both']

class CharityPostCreate(BaseModel):
    title: str
    description: Optional[str] = None
    donationMode: DonationMode = 'money'
    amountNeeded: Optional[float] = Field(default=None, gt=0)
    foodGoalKg: Optional[float] = Field(default=None, gt=0)

    @model_validator(mode='after')
    def check_goals(self):
        if self.donationMode in ('money', 'both') and self.amountNeeded is None:
            raise ValueError('amountNeeded is required for money or both mode')
        if self.donationMode in ('food', 'both') and self.foodGoalKg is None:
            raise ValueError('foodGoalKg is required for food or both mode')
        return self

class CharityPostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    amountNeeded: Optional[float] = Field(default=None, gt=0)
    foodGoalKg: Optional[float] = Field(default=None, gt=0)
    status: Optional[Literal['active', 'funded', 'closed']] = None
    # donationMode is intentionally not updatable after creation

class CharityPostResponse(BaseModel):
    charityID: UUID
    userID: UUID
    title: str
    description: Optional[str] = None
    donationMode: str
    currentAmount: float
    amountNeeded: Optional[float]
    currentFoodKg: float
    foodGoalKg: Optional[float]
    status: str
    createdAt: datetime

class CharityPostDonateRequest(BaseModel):
    donationType: Literal['money', 'food']
    # Money fields
    amount: Optional[float] = Field(default=None, gt=0)
    # Food fields
    foodID: Optional[UUID] = None
    quantity: Optional[int] = Field(default=None, gt=0)

    @model_validator(mode='after')
    def check_fields(self):
        if self.donationType == 'money' and self.amount is None:
            raise ValueError('amount is required for money donations')
        if self.donationType == 'food' and (self.foodID is None or self.quantity is None):
            raise ValueError('foodID and quantity are required for food donations')
        return self
```

---

### FD-5 · Backend service — Update `charity_post_service.py`

Replace `increment_donation` with two typed methods:

```python
def donate_money(post_id: str, amount: float):
    return supabase_admin.rpc("donate_money_to_post", {
        "p_post_id": post_id,
        "p_amount": amount
    }).execute()

def donate_food(post_id: str, food_id: str, quantity: int):
    return supabase_admin.rpc("donate_food_to_post", {
        "p_post_id": post_id,
        "p_food_id": food_id,
        "p_quantity": quantity
    }).execute()

def record_donation(post_id: str, user_id: str, donation_type: str,
                    amount: float = None, food_id: str = None,
                    quantity: int = None, food_kg: float = None):
    return supabase_admin.table("Donation").insert({
        "postID": post_id,
        "userID": user_id,
        "donationType": donation_type,
        "amount": amount,
        "foodID": food_id,
        "quantity": quantity,
        "foodKg": food_kg,
    }).execute()
```

---

### FD-6 · Backend API — Update the donate endpoint

**File:** `app/backend/api/charity_posts.py`

The existing `POST /{charity_id}/donate` endpoint needs to route on `donationType` and
call the appropriate service method. It also needs to look up `Food.weightKg` for food
donations to record `foodKg` in the audit row.

```python
@router.post("/{charity_id}/donate", response_model=CharityPostResponse)
async def donate_to_post(
    charity_id: UUID,
    donation: CharityPostDonateRequest,
    current_user: dict = Depends(require_role("buyer"))
):
    post_id = str(charity_id)
    user_id = current_user["userID"]

    if donation.donationType == 'money':
        response = charity_post_service.donate_money(post_id, donation.amount)
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to process money donation")
        charity_post_service.record_donation(
            post_id, user_id, 'money', amount=donation.amount
        )
        return response.data[0]

    else:  # food
        # Look up weightKg to store in Donation record
        food_res = supabase_admin.table("Food") \
            .select("weightKg") \
            .eq("foodID", str(donation.foodID)) \
            .single().execute()
        if not food_res.data:
            raise HTTPException(status_code=404, detail="Food item not found")
        food_kg = food_res.data["weightKg"] * donation.quantity

        response = charity_post_service.donate_food(
            post_id, str(donation.foodID), donation.quantity
        )
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to process food donation")
        charity_post_service.record_donation(
            post_id, user_id, 'food',
            food_id=str(donation.foodID), quantity=donation.quantity, food_kg=food_kg
        )
        return response.data[0]
```

> **Note:** The `supabase_admin` Food lookup here should be moved to a food service
> once one exists, to keep the API layer clean.

---

### FD-7 · SocialImpact — Count food donations toward the donor's impact

Currently `SocialImpact` only links to a `purchaseID`. Food donations also rescue food,
so donors should see their donated kilos reflected in `SocialImpactView`.

**Option A (recommended) — extend `SocialImpact` to also accept a `donationID`:**

```sql
ALTER TABLE "SocialImpact"
  ADD COLUMN "donationID" UUID REFERENCES "Donation"("donationID") ON DELETE CASCADE,
  DROP CONSTRAINT uq_socialimpact_purchase,  -- drop the single-column unique (B-2 adds this first)
  ADD CONSTRAINT ck_socialimpact_source CHECK (
    ("purchaseID" IS NOT NULL AND "donationID" IS NULL)
    OR
    ("donationID" IS NOT NULL AND "purchaseID" IS NULL)
  ),
  ADD CONSTRAINT uq_socialimpact_purchase  UNIQUE ("purchaseID"),   -- keep for purchases
  ADD CONSTRAINT uq_socialimpact_donation  UNIQUE ("donationID");   -- new for donations
```

Then in `donate_food_to_post` (or in `FD-6`'s API handler), after the RPC succeeds:

```python
social_impact_service.create_food_donation_impact(
    donation_id=new_donation_id,
    user_id=user_id,
    rescued_kg=food_kg
)
```

**`social_impact_service.py` additions:**

```python
def create_food_donation_impact(donation_id: str, user_id: str, rescued_kg: float):
    carbon_offset = rescued_kg * CO2_PER_KG
    people_fed = math.floor(rescued_kg / KG_PER_MEAL)
    return supabase_admin.table("SocialImpact").insert({
        "donationID": donation_id,
        "carbonOffset": carbon_offset,
        "rescuedKilos": rescued_kg,
        "peopleFed": people_fed,
    }).execute()
```

Update `fetch_summary_by_user` to also aggregate donation-based impact rows:

```python
def fetch_summary_by_user(user_id: str):
    # Purchase-based impact (existing logic from B-3 fix)
    ...
    # Donation-based impact
    donation_res = supabase_admin.table("Donation") \
        .select("donationID") \
        .eq("userID", user_id) \
        .eq("donationType", "food") \
        .execute()
    donation_ids = [r["donationID"] for r in donation_res.data]
    donation_impact = []
    if donation_ids:
        di_res = supabase_admin.table("SocialImpact") \
            .select("*").in_("donationID", donation_ids).execute()
        donation_impact = di_res.data

    all_rows = purchase_impact + donation_impact
    return {
        "totalCarbonOffset": sum(r["carbonOffset"] for r in all_rows),
        "totalRescuedKilos": sum(r["rescuedKilos"] for r in all_rows),
        "totalPeopleFed":    sum(r["peopleFed"] for r in all_rows),
        "purchaseCount":     len(purchase_ids),
    }
```

---

### FD-8 · Frontend — `CharityPost` type and `CharityPostCreate` form

**File:** `app/frontend/src/api/types.ts`

```ts
export interface CharityPost {
  charityID: string;
  userID: string;
  title: string;
  description?: string;
  donationMode: "money" | "food" | "both";
  currentAmount: number;
  amountNeeded: number | null;
  currentFoodKg: number;
  foodGoalKg: number | null;
  status: "active" | "funded" | "closed";
  createdAt: string;
}
```

**File:** `app/frontend/src/components/CharityDashboard.tsx` — `CreateCharityPostModal`

Add a `donationMode` selector and conditionally show `amountNeeded` / `foodGoalKg`
inputs:

```tsx
const [donationMode, setDonationMode] = useState<'money' | 'food' | 'both'>('money');

// In the form:
<select value={donationMode} onChange={e => setDonationMode(e.target.value as ...)}>
  <option value="money">Money only</option>
  <option value="food">Food only</option>
  <option value="both">Money + Food</option>
</select>

{(donationMode === 'money' || donationMode === 'both') && (
  <input type="number" placeholder="Amount Needed (₱)" ... />
)}
{(donationMode === 'food' || donationMode === 'both') && (
  <input type="number" placeholder="Food Goal (kg)" ... />
)}
```

---

### FD-9 · Frontend — `DonateModal` — branch on donation type

**File:** `app/frontend/src/components/DonateModal.tsx`

The modal needs to detect `post.donationMode` and render the appropriate UI:

- **`'money'`** → existing amount input (current behaviour).
- **`'food'`** → food item browser: fetch available `Food` listings, let the donor pick
  one and enter a quantity. Show the item's weight so the donor sees how many kg
  they're contributing.
- **`'both'`** → show two tabs ("Donate Money" / "Donate Food") and render the
  corresponding form in each tab.

The submission payload changes based on the selected type:

```ts
// Money
charityPostAPI.donateToPost(post.charityID, {
  donationType: "money",
  amount: numAmount,
});

// Food
charityPostAPI.donateToPost(post.charityID, {
  donationType: "food",
  foodID: selectedFood.foodID,
  quantity: numQuantity,
});
```

---

### FD-10 · Frontend — `CharityPostCard` — dual progress bar

**File:** `app/frontend/src/components/CharityPostCard.tsx`

The current single progress bar assumes money only. Update to render one or two bars
depending on `donationMode`:

```tsx
{
  (post.donationMode === "money" || post.donationMode === "both") && (
    <ProgressBar
      label="Funds"
      current={post.currentAmount}
      goal={post.amountNeeded!}
      unit="₱"
    />
  );
}
{
  (post.donationMode === "food" || post.donationMode === "both") && (
    <ProgressBar
      label="Food"
      current={post.currentFoodKg}
      goal={post.foodGoalKg!}
      unit="kg"
    />
  );
}
```

Extract the existing inline progress markup into a reusable `ProgressBar` sub-component
to avoid duplication.

---

### FD-11 · Business rule — campaign "funded" status with dual goals

**Relates to L-3 (campaign lifecycle)**

A campaign is fully funded only when **all** of its active goals are met:

- `money`-mode post: `currentAmount >= amountNeeded`
- `food`-mode post: `currentFoodKg >= foodGoalKg`
- `both`-mode post: both conditions above

Auto-transition logic should be added to the end of both RPCs (`FD-3`):

```sql
-- At the end of each RPC, check if all applicable goals are now met
IF (rec."donationMode" = 'money' AND "currentAmount" >= "amountNeeded")
   OR (rec."donationMode" = 'food'  AND "currentFoodKg" >= "foodGoalKg")
   OR (rec."donationMode" = 'both'
       AND "currentAmount" >= "amountNeeded"
       AND "currentFoodKg" >= "foodGoalKg")
THEN
  UPDATE "CharityPost" SET "status" = 'funded' WHERE "charityID" = p_post_id;
END IF;
```

---

## 🔴 BUGS — Fix These First

### B-1 · Negative / zero donations are accepted

**File:** `app/backend/models/charity_post.py` · `CharityPostDonateRequest`

`amount: float` has no validator. A payload of `{"amount": -500}` will call
`increment_charity_amount` with a negative number and _decrement_ `currentAmount`.
The RPC itself has no guard either.

**Fix:**

```python
# model
from pydantic import Field
class CharityPostDonateRequest(BaseModel):
    amount: float = Field(gt=0, description="Donation must be greater than zero")
```

```sql
-- migration: add DB-level guard in the RPC
CREATE OR REPLACE FUNCTION increment_charity_amount(p_charity_id UUID, p_amount NUMERIC)
RETURNS SETOF "CharityPost" LANGUAGE plpgsql AS $$
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Donation amount must be greater than zero';
  END IF;
  RETURN QUERY
    UPDATE "CharityPost"
    SET "currentAmount" = "currentAmount" + p_amount
    WHERE "charityID" = p_charity_id
    RETURNING *;
END;
$$;
```

---

### B-2 · `SocialImpact` table allows duplicate records per purchase

**File:** `app/supabase/migrations/20260425000000_initial_schema.sql`

`SocialImpact.purchaseID` has no UNIQUE constraint. If `create_impact()` is called twice
(e.g., a retry or race condition), two rows are inserted. This causes the subsequent
`.single()` call in `fetch_impact_by_purchase` to throw a `PostgrestError: JSON object requested, multiple (or no) rows returned`.

**Fix:**

```sql
-- new migration
ALTER TABLE "SocialImpact"
  ADD CONSTRAINT uq_socialimpact_purchase UNIQUE ("purchaseID");
```

---

### B-3 · `fetch_summary_by_user` likely returns ALL rows, not just the user's

**File:** `app/backend/services/social_impact_service.py`

```python
response = supabase_admin.table("SocialImpact") \
    .select("*, Purchase!inner(userID)") \
    .eq("Purchase.userID", user_id) \   # ← this filter may be silently ignored
    .execute()
```

The Supabase Python client's `.eq()` does not reliably filter on dot-notated joined-table
columns. The `!inner` join _excludes_ rows with no matching purchase, but it does **not**
filter by `userID`. Every buyer's impact rows are aggregated into one summary.

**Fix — query via Purchase first:**

```python
def fetch_summary_by_user(user_id: str):
    # Step 1: get this user's purchase IDs
    purchase_res = supabase_admin.table("Purchase") \
        .select("purchaseID") \
        .eq("userID", user_id) \
        .execute()
    purchase_ids = [r["purchaseID"] for r in purchase_res.data]
    if not purchase_ids:
        return {"totalCarbonOffset": 0.0, "totalRescuedKilos": 0.0,
                "totalPeopleFed": 0, "purchaseCount": 0}

    # Step 2: aggregate SocialImpact for those purchases
    response = supabase_admin.table("SocialImpact") \
        .select("*") \
        .in_("purchaseID", purchase_ids) \
        .execute()
    rows = response.data
    return {
        "totalCarbonOffset": sum(r["carbonOffset"] for r in rows),
        "totalRescuedKilos": sum(r["rescuedKilos"] for r in rows),
        "totalPeopleFed":    sum(r["peopleFed"] for r in rows),
        "purchaseCount":     len(rows),
    }
```

---

### B-4 · `CharityPostsFeed` has a stale-closure pagination bug

**File:** `app/frontend/src/components/CharityPostsFeed.tsx`

`fetchPosts(false)` (Load More) closes over the `offset` state at the time the function
was created, not the current value. On fast clicks or after a re-render cycle, the wrong
offset is sent to the API, resulting in duplicate posts or skipped pages.

**Fix — read offset via a ref or pass it explicitly:**

```tsx
const offsetRef = React.useRef(0);

const fetchPosts = async (isInitial = true) => {
  const currentOffset = isInitial ? 0 : offsetRef.current;
  // ...
  const newCount = newPosts.length;
  offsetRef.current = isInitial ? newCount : offsetRef.current + newCount;
  setOffset(offsetRef.current); // keep state in sync for display if needed
};
```

---

### B-5 · `CharityPost.amountNeeded` allows zero → divide-by-zero in progress bar

**File:** `app/backend/models/charity_post.py` · `CharityPostCreate`

If `amountNeeded` is submitted as `0`, the progress calculation
`(currentAmount / amountNeeded) * 100` results in `Infinity` / `NaN` in the frontend,
breaking all progress bars and percentage displays for that card.

**Fix:**

```python
from pydantic import Field
class CharityPostCreate(BaseModel):
    title: str
    description: Optional[str] = None
    amountNeeded: float = Field(gt=0, description="Goal amount must be greater than zero")
```

---

### B-6 · `Charity.organizationName` is nullable in DB but required in Pydantic model

**File:** `app/supabase/migrations/20260425000000_initial_schema.sql` + `app/backend/models/charity.py`

The `Charity` table defines `"organizationName" TEXT` with no `NOT NULL` constraint, so
a row can have `NULL` there. But `CharityResponse.organizationName: str` (and
`CharityProfileResponse`) is non-optional. Any charity record with a null name will fail
Pydantic validation and return a 500.

**Fix (pick one or both):**

```sql
-- Option A: enforce at DB level (recommended)
ALTER TABLE "Charity" ALTER COLUMN "organizationName" SET NOT NULL;
```

```python
# Option B: make model tolerant in the meantime
class CharityResponse(BaseModel):
    userID: UUID
    organizationName: Optional[str] = ""
```

---

### B-7 · `CharityApplication` missing `createdAt` column in schema

**File:** `app/supabase/migrations/20260425000000_initial_schema.sql`

The `CharityApplication` table has no `createdAt` column, but the frontend type
`CharityApplication.createdAt: string` expects it. Fetching applications will either
return `undefined`/`null` for the field or cause serialization issues.

**Fix:**

```sql
ALTER TABLE "CharityApplication"
  ADD COLUMN "createdAt" TIMESTAMPTZ DEFAULT now();
```

---

## 🟡 BUSINESS LOGIC — These Need Decisions + Implementation

### L-1 · No donation history / audit trail

**Files:** `charity_posts.py`, `charity_post_service.py`

`donate_to_post` only increments `currentAmount` via the atomic RPC. There is no record
of _who_ donated, _when_, or _how much_. This means:

- A charity cannot see their donor list.
- There is no way to issue refunds.
- Total raised and donor count cannot be reported separately.

> ⚠️ **The `Donation` table schema has been updated to support both money and food
> donations.** See **FD-2** for the full table definition. Do not implement the simple
> money-only version here — go straight to FD-2.

---

### L-2 · Overfunding is not prevented

**Files:** `charity_post_service.py` · `increment_charity_amount` RPC

A post whose `currentAmount` has already reached `amountNeeded` still accepts further
donations. There is no cap enforced at the DB, service, or API level.

> ⚠️ **This RPC is being replaced by two typed RPCs (`donate_money_to_post` and
> `donate_food_to_post`) that each include overfunding caps.** See **FD-3** for the
> full implementation. Do not patch `increment_charity_amount` in isolation.

---

### L-3 · No campaign status / lifecycle — a funded post stays "open" forever

**Files:** `models/charity_post.py`, `initial_schema.sql`

Once `currentAmount >= amountNeeded`, the post has no `status` field to transition to
`"funded"` or `"closed"`. Donors can keep donating (see L-2), and the charity has no
way to explicitly close or archive a campaign.

> ⚠️ **The `status` field and auto-transition logic are now part of the money/food
> donation feature.** See **FD-1** (schema) and **FD-11** (funded condition with dual
> goals). The `CharityPostUpdate` model with `status` is defined in **FD-4**.

---

### L-4 · Buyer receives no notification when their social impact is computed

**Files:** `purchase_service.py`, `social_impact_service.py`, `notification_service.py`

After `complete_purchase()` → `create_impact()`, the buyer is never notified. The
notification service already exists and is wired elsewhere.

**Fix — add to `complete_purchase` in `purchase_service.py`:**

```python
from services import notification_service

# After create_impact():
notification_service.send_notification(
    user_id=purchase["userID"],
    title="Your Impact Summary is Ready 🌱",
    message=f"Your purchase rescued food and offset carbon. Check your impact!",
    type="impact",
    link="/impact"
)
```

---

### L-5 · Direct DB access in API layer (`social_impact.py`)

**File:** `app/backend/api/social_impact.py`

The ownership check in `get_impact_by_purchase` queries `supabase_admin` directly
inside the router. DB logic belongs in the service layer.

**Fix — add to `purchase_service.py`:**

```python
def fetch_purchase_owner(purchase_id: str) -> Optional[str]:
    res = supabase_admin.table("Purchase") \
        .select("userID") \
        .eq("purchaseID", purchase_id) \
        .single() \
        .execute()
    return res.data["userID"] if res.data else None
```

Then call `purchase_service.fetch_purchase_owner(...)` from the API.

---

### L-6 · Non-atomic purchase flow — partial stock deduction on failure

**File:** `app/backend/services/purchase_service.py`

Stock is decremented in a plain Python loop. If the insert into `Purchase` or
`PurchaseItems` fails mid-loop, stock is already reduced with no matching purchase record.
The SocialImpact metric will never be computed for those items, and stock is silently
lost.

**Fix:** Wrap the entire `create_purchase` flow in a Postgres function (RPC) or use
Supabase's transaction support so that stock decrements and the purchase insert are
atomic.

---

## 🟠 NAMING / CLARITY — Low Risk but Causes Confusion

### N-1 · `charityID` in `CharityPost` is a post PK, not a charity org ID

**Files:** `models/charity_post.py`, `initial_schema.sql`, `charity_posts.py`, multiple frontend files

The primary key of `CharityPost` is named `charityID`. This strongly implies it is the
ID of a charity organisation, but it is actually the ID of the post itself. The actual
charity org ID is `userID`. This naming causes confusion when reading the ownership check:

```python
if post_response.data["userID"] != current_user["userID"]:  # correct, but why not charityID?
```

**Recommended rename:** `charityID` → `postID` across the table, models, services, API,
and frontend types. This is a breaking migration that requires a coordinated rename.

---

### N-2 · Route parameter `charity_id` in `charity_posts.py` routes

Related to N-1 — `GET /charity-posts/{charity_id}` implies filtering by charity
organisation, but it fetches a single post by its PK. Should be `/{post_id}` once N-1
is resolved.

---

## 🔵 FRONTEND UX — Polish / Security

### F-1 · Charity email address exposed publicly in `CharityProfileView`

**File:** `app/frontend/src/components/CharityProfileView.tsx`

```tsx
<span className="meta-item">{profile.emailAddress}</span>
```

The charity's personal email is rendered for any visitor. At minimum, make this opt-in
or replace it with a contact form.

---

### F-2 · "Donate Now" button visible to unauthenticated / non-buyer users

**File:** `app/frontend/src/components/CharityPostCard.tsx` / `CharityPostsFeed.tsx`

The backend correctly rejects donations from non-buyers, but the UI shows the
"Donate Now" button to everyone. A guest who clicks it gets a confusing 401/403 error.

**Fix:** Read the current user's role from auth context and hide/disable the donate button
if the user is not authenticated or not a buyer.

---

### F-3 · No success feedback after creating or editing a post in `CharityDashboard`

**File:** `app/frontend/src/components/CharityDashboard.tsx`

After `onSuccess()` is called the modal closes and data refreshes silently. There is no
toast or inline confirmation. Add a toast or a brief success banner so the charity knows
the action completed.

---

### F-4 · Double-fetch on tab switch with active search in `CharityPostsFeed`

**File:** `app/frontend/src/components/CharityPostsFeed.tsx`

When `activeTab` changes to `'posts'` while `search` is non-empty, both `useEffect`
hooks fire: one immediately and one after 500 ms. Two identical API calls are made.

**Fix:** Combine into a single `useEffect` or debounce the tab-switch fetch:

```tsx
useEffect(() => {
  if (activeTab !== "posts") return;
  const timer = setTimeout(
    () => fetchPosts(true),
    activeTab === "posts" ? 0 : 500,
  );
  return () => clearTimeout(timer);
}, [activeTab, search]);
```

---

## ✅ Recommended Implementation Order

**Phase 1 — Fix bugs first (unblock everything else)**

| #   | Task                                                 | File(s)                                   | Effort |
| --- | ---------------------------------------------------- | ----------------------------------------- | ------ |
| B-6 | Add `NOT NULL` to `Charity.organizationName`         | migration                                 | XS     |
| B-7 | Add `createdAt` column to `CharityApplication`       | migration                                 | XS     |
| B-2 | Add `UNIQUE` constraint on `SocialImpact.purchaseID` | migration                                 | XS     |
| B-3 | Fix `fetch_summary_by_user` join filter              | `social_impact_service.py`                | S      |
| B-4 | Fix stale-closure pagination bug                     | `CharityPostsFeed.tsx`                    | S      |
| F-3 | Add success toast in `CharityDashboard`              | `CharityDashboard.tsx`                    | XS     |
| F-1 | Hide email in `CharityProfileView`                   | `CharityProfileView.tsx`                  | XS     |
| F-2 | Hide donate button for non-buyers                    | `CharityPostCard.tsx`                     | S      |
| L-5 | Move ownership check to `purchase_service`           | `social_impact.py`, `purchase_service.py` | S      |
| L-4 | Notify buyer on impact creation                      | `purchase_service.py`                     | S      |

**Phase 2 — Money + Food donation feature (replaces L-1, L-2, L-3 individually)**

> Do these together — they share the same migration and the RPCs are co-dependent.

| #       | Task                                                                                        | File(s)                               | Effort |
| ------- | ------------------------------------------------------------------------------------------- | ------------------------------------- | ------ |
| FD-1    | Add `donationMode`, `foodGoalKg`, `currentFoodKg`, `status` columns to `CharityPost`        | migration                             | S      |
| FD-2    | Create `Donation` table (money + food discriminated)                                        | migration                             | S      |
| FD-3    | Replace `increment_charity_amount` with `donate_money_to_post` + `donate_food_to_post` RPCs | migration                             | M      |
| FD-4    | Update `CharityPost` Pydantic models (create/update/response/donate request)                | `models/charity_post.py`              | M      |
| B-1+B-5 | Validators for amount/goals now covered by FD-4 `model_validator`                           | `models/charity_post.py`              | —      |
| FD-5    | Update `charity_post_service.py` with typed donate + record_donation methods                | `charity_post_service.py`             | S      |
| FD-6    | Update donate endpoint to branch on `donationType`                                          | `charity_posts.py`                    | M      |
| FD-7    | Extend `SocialImpact` to accept `donationID`; update `fetch_summary_by_user`                | migration, `social_impact_service.py` | M      |
| FD-8    | Update `CharityPost` TS type + create/edit form in `CharityDashboard`                       | `types.ts`, `CharityDashboard.tsx`    | M      |
| FD-9    | Update `DonateModal` to branch on `donationMode` (money / food / both tabs)                 | `DonateModal.tsx`                     | L      |
| FD-10   | Update `CharityPostCard` for dual progress bars                                             | `CharityPostCard.tsx`                 | S      |
| FD-11   | Auto-transition `status` to `'funded'` in RPCs when both goals are met                      | migration (update RPCs)               | S      |

**Phase 3 — Large refactors (do last)**

| #   | Task                                           | File(s)                         | Effort |
| --- | ---------------------------------------------- | ------------------------------- | ------ |
| L-6 | Make `create_purchase` atomic                  | `purchase_service.py` / new RPC | L      |
| N-1 | Rename `charityID` → `postID` in `CharityPost` | migration + full codebase       | XL     |
