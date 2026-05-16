# TODO — Charity, CharityPost & SocialImpact (Sprint Update)

_Scope: `charity_service`, `charity_post_service`, `social_impact_service` (backend) and
`CharityProfileView`, `CharityPostsFeed`, `CharityDirectory`, `DonateModal`, `CharityPostCard`,
`CharityDashboard`, `ProfileView`, `App.tsx` (frontend)._

---

## 🔴 Bugs / Correctness Issues

### B-7 — ✅ Fixed

---

### B-8 — ✅ Fixed

**Root cause — wrong data source.**
`DonateModal` calls `foodAPI.list({ edible_only: true })` to populate the food picker. That endpoint
(`GET /products/`) returns seller `Food` table rows — marketplace listings that belong to sellers.
Buyers do not own these rows; donating them would silently decrement a seller's stock without the
seller's knowledge or involvement.

The correct source for a buyer donating their own food is their purchase history:
`PurchaseItems` joined with `Food`, filtered to items from completed purchases where
`stockQuantity > 0` (or equivalent remaining quantity).

**Required changes (backend):**

1. Add a new endpoint `GET /purchases/my-food` (buyer-auth required) that returns food items
   the buyer has actually purchased, with remaining donatable quantity derived from their
   `PurchaseItems` records.
2. Alternatively, expose a query param on an existing endpoint, but a dedicated route is cleaner.

**Required changes (frontend):**

1. In `DonateModal`, replace the `foodAPI.list(...)` call with a new `purchaseAPI.getMyFood()` call
   (or equivalent).
2. Update the `FoodItem` picker UI to reflect buyer-owned quantities rather than seller stock counts.
3. Adjust the `donateToPost` payload: `foodID` must now refer to an item the buyer actually owns;
   confirm the backend RPC `donate_food_to_post` handles this correctly (currently it just decrements
   `Food.stockQuantity`, which is fine only if the food ID is a marketplace item — needs review for
   buyer-owned flow).

**Files:**

- `app/frontend/src/components/DonateModal.tsx`
- `app/backend/api/purchases.py` (new endpoint)
- `app/backend/services/purchase_service.py` (new helper)

---

## 🟡 Missing Features

### B-9 — Charity users can still become a seller or buyer (role exclusivity not enforced)

**Root cause — no role guard in the upgrade endpoint or the UI.**

`User.role` is a single column constrained to `'buyer' | 'seller' | 'charity' | 'admin'`. A charity
account should be mutually exclusive from buyer and seller roles, but two gaps currently allow a
charity to silently gain a second role:

1. **Backend — `POST /users/upgrade`** has no check for `role == 'charity'`. Any authenticated user
   (including a charity) can call it and have their row updated to `role = 'seller'`, overwriting
   the `'charity'` value and orphaning their `Charity` table record.

2. **Frontend — `ProfileView.tsx`** only renders the "Become a Seller" and "Become a Charity"
   blocks when `profile.role === 'buyer'`, so a charity cannot currently click "Become a Seller"
   in the UI. However, there is no backend guard, so a direct API call still succeeds. The UI
   condition is also fragile — if the rendering logic ever changes, the hole re-opens.

Additionally, `submit_application` (charity application service) has no role check either: a seller
could submit a charity application and, if approved, `review_application` would update their role
from `'seller'` to `'charity'` without cleaning up the `Seller` table row.

**Required changes:**

**Backend:**

1. **`POST /users/upgrade`** — add an explicit role guard:

   ```python
   if current_user["role"] == "charity":
       raise HTTPException(status_code=403, detail="Charity accounts cannot register as a seller.")
   ```

2. **`POST /charity-applications/`** (`create_application`) — add a role guard to block sellers
   from applying:

   ```python
   if current_user["role"] == "seller":
       raise HTTPException(status_code=403, detail="Seller accounts cannot apply for charity status.")
   if current_user["role"] == "charity":
       raise HTTPException(status_code=403, detail="You are already registered as a charity.")
   ```

3. **`charity_application_service.review_application`** (optional hardening) — when approving,
   assert that `User.role` is still `'buyer'` before overwriting it, to catch any race condition
   where role changed between application submission and admin approval.

**Frontend:**

1. **`ProfileView.tsx`** — the "Become a Seller" block is already hidden for non-buyers
   (`profile.role === 'buyer'`), so charity users won't see the button. No change needed there,
   but add a comment noting the backend is the authoritative guard.
2. **`ProfileView.tsx`** — the "Become a Charity" block is likewise hidden for non-buyers. Confirm
   it is also hidden for `role === 'seller'` (it currently is, since both blocks gate on
   `role === 'buyer'`). No visual change needed, but worth an explicit code comment for clarity.

**Files:**

- `app/backend/api/users.py` — `upgrade_to_seller` endpoint
- `app/backend/api/charity_applications.py` — `create_application` endpoint
- `app/backend/services/charity_application_service.py` — `review_application` (optional guard)
- `app/frontend/src/components/ProfileView.tsx` — comments only, no logic change needed

---

### F-9 — ✅ Fixed

Per the food-first project scope, `CharityPost` should only support `donationMode: 'food'`.
Currently money-mode paths still exist in the UI and are just visually disabled.

**Required changes:**

**Backend:**

1. The `donate_to_post` endpoint already guards money donations at the RPC level, but the
   `CharityPostDonateRequest` model still accepts `donationType: 'money'`. Add an explicit
   `HTTPException(400)` if `donationType == 'money'` is sent, so the API is self-documenting
   about the current scope.
2. The `CharityPostCreate` model defaults `donationMode` to `'money'`. Change the default to
   `'food'` (already done per B-2, but verify the migration/seed data has no `money`-only posts
   that would break the UI).

**Frontend:**

1. **`DonateModal`** — remove the `activeTab` state and all `money` tab rendering entirely.
   The modal should open directly into the food donation flow with no tabs. The hidden money
   form (currently rendered with `opacity: 0.5` and disabled) should be deleted, not just
   hidden, to avoid dead code.
2. **`CharityPostCard`** — the mode badge currently renders `post.donationMode.toUpperCase()`.
   Since only food posts exist, either remove the badge or hard-code it to "Food Drive".
   The `donationMode !== 'money'` guard on the food progress bar can be simplified to always show.
3. **`CharityPostsFeed`** — the "Mode" filter chip row currently includes `'all'` and `'food'`
   options. With only food posts, this filter serves no purpose; remove the filter chip row
   entirely, or at minimum remove the `'all'` chip to avoid surfacing a no-op filter.
4. **`CharityDashboard` / `CreateCharityPostModal`** — ensure `donationMode` is hard-coded to
   `'food'` in the create form and is not shown as a user-selectable field.

**Files:**

- `app/frontend/src/components/DonateModal.tsx`
- `app/frontend/src/components/CharityPostCard.tsx`
- `app/frontend/src/components/CharityPostsFeed.tsx`
- `app/backend/api/charity_posts.py`
- `app/backend/models/charity_post.py`

---

### F-10 — ✅ Fixed

Buyers should be able to pick food items from their own past purchases (not seller marketplace
listings) and donate them to an active food-mode charity post.

**Backend:**

1. **New endpoint: `GET /purchases/my-food`** (requires `buyer` role)
   - Queries `PurchaseItems` for all purchases by the current buyer.
   - Joins with `Food` to get `foodName`, `weightKg`, `expirationDate`, `picture`.
   - Returns only items where the buyer still has remaining quantity to donate (tracked either
     via a new `donatedQuantity` column on `PurchaseItems`, or by comparing against existing
     `Donation` records for that buyer+foodID combination).
   - Response shape should match what `DonateModal` already expects for the food picker list.

2. **`donate_food_to_post` RPC review** — the existing RPC decrements `Food.stockQuantity`.
   When the donor is a buyer donating their own purchased food (not the seller's live listing
   stock), decrementing the seller's `Food.stockQuantity` is incorrect. Two options:
   - **(Preferred)** Track donated quantity on `PurchaseItems` with a new `donatedQuantity` column
     and leave `Food.stockQuantity` untouched for buyer-originated donations.
   - **(Alternative)** Create a separate RPC `donate_buyer_food_to_post` that records the donation
     without touching `Food.stockQuantity`.

3. **Donation record** — `record_donation` already writes to the `Donation` table with `foodID`
   and `quantity`. No schema change needed there, but confirm `SocialImpact` creation still fires
   correctly for buyer-originated donations (it should, since it keys off `donationID`).

**Frontend:**

1. In `DonateModal`, replace `foodAPI.list({ edible_only: true })` with
   `purchaseAPI.getMyFood()` (new API function).
2. Update the food picker UI:
   - Change column label from "Seller: …" to "From my purchase" or similar.
   - Show donatable quantity (purchased qty minus already donated) rather than seller stock count.
   - Keep expiry-date sort (soonest first) — already correct behavior.
3. Add `getMyFood` to `purchaseAPI` in `app/frontend/src/api/apis.ts`:
   ```ts
   getMyFood: () => api.get('/purchases/my-food'),
   ```

**Migration (if tracking donated qty on PurchaseItems):**

```sql
ALTER TABLE "PurchaseItems"
  ADD COLUMN "donatedQuantity" INTEGER NOT NULL DEFAULT 0
  CHECK ("donatedQuantity" >= 0 AND "donatedQuantity" <= "quantity");
```

**Files:**

- `app/backend/api/purchases.py`
- `app/backend/services/purchase_service.py`
- `app/supabase/migrations/<timestamp>_buyer_food_donation.sql` (if schema change needed)
- `app/frontend/src/api/apis.ts`
- `app/frontend/src/components/DonateModal.tsx`

---

### F-11 — ✅ Fixed

**Root cause — `App.tsx` routes charity users exclusively to `CharityDashboard` with no navigation to `ProfileView`, `SocialImpactView`, or notifications.**

When a user with `role === 'charity'` logs in, `App.tsx` sets `view = 'charity'` and renders only
`<CharityDashboard>`. Unlike buyers — who get `ListingsFeed` with a full navbar containing
**Listings**, **Charity**, **History**, **Impact**, and **Profile** tabs — charity users have no
equivalent navigation. The dashboard renders a plain header with only two buttons:

- **"Edit Profile"** → opens `CharityProfileModal`, a minimal inline form covering org name, name,
  phone, and address only. This is _not_ the full `ProfileView`.
- **"Switch to Buyer"** → calls `onSwitchRole()` which sets `view = 'buyer'` in `App.tsx` and
  drops the charity into `ListingsFeed`. This is the only accidental path to `ProfileView` and
  `SocialImpactView`, but it is semantically wrong — charity users are not buyers, and presenting
  them as one to access their own account profile is a UX bug.

The full `ProfileView` already handles `role === 'charity'` correctly: it shows the charity info
card, hides the buyer/seller upgrade prompts, and includes the logout button. `SocialImpactView`
is role-agnostic and works off the logged-in user's data. Both components just need to be reachable
from inside `CharityDashboard`.

**What charity is missing compared to buyer/seller:**

| Feature                                             | Buyer             | Seller                 | Charity |
| --------------------------------------------------- | ----------------- | ---------------------- | ------- |
| Full `ProfileView` (account details, stats, logout) | ✅ Profile tab    | ✅ via Switch to Buyer | ❌      |
| Logout button                                       | ✅ in ProfileView | ✅ via Switch to Buyer | ❌      |
| `SocialImpactView`                                  | ✅ Impact tab     | ✅ via Switch to Buyer | ❌      |
| Notification bell                                   | ✅ in navbar      | ✅ in sidebar          | ❌      |

**Required changes:**

**`app/frontend/src/components/CharityDashboard.tsx`:**

1. Add a tab/nav system with at minimum three destinations:
   - **Dashboard** — the existing posts + stats content (current default view)
   - **Impact** — renders `<SocialImpactView />`
   - **Profile** — renders `<ProfileView />`

2. Add a `<NotificationDropdown>` to the dashboard header, consistent with buyer/seller UX.

3. **Remove the "Switch to Buyer" button.** It is semantically wrong for a charity user. If
   browsing the marketplace is ever a valid charity use case, replace it with a clearly labelled
   "Browse Marketplace" action that does not imply a role change (and confirm with PM first).

4. The "Edit Profile" button and `CharityProfileModal` can remain as a quick-edit shortcut inside
   the Dashboard tab, or be removed in favour of pointing users to the full Profile tab — decide
   based on UX preference. Either way, the full `ProfileView` must also be reachable.

```tsx
// Suggested additions to CharityDashboard.tsx
import ProfileView from './ProfileView';
import SocialImpactView from './SocialImpactView';
import NotificationDropdown from './NotificationDropdown';

type CharityTab = 'dashboard' | 'impact' | 'profile';
const [activeTab, setActiveTab] = useState<CharityTab>('dashboard');

// Header nav:
<nav className="charity-nav">
  <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
  <button className={activeTab === 'impact' ? 'active' : ''} onClick={() => setActiveTab('impact')}>Impact</button>
  <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>Profile</button>
  <NotificationDropdown ... />
</nav>

// Body:
{activeTab === 'dashboard' && <> {/* existing posts/stats/create content */} </>}
{activeTab === 'impact'    && <SocialImpactView />}
{activeTab === 'profile'   && <ProfileView />}
```

**`app/frontend/src/App.tsx`:** No changes needed. The existing `view === 'charity' → <CharityDashboard>` mapping stays.

**`app/frontend/src/components/ProfileView.tsx`:** No logic changes needed. Verify that
`charityAPI.getMyApplications()` (called inside `ProfileView`) does not throw for charity users —
it will return their approved application record, which is fine; just confirm `hasPendingApplication`
evaluates to `false` for an approved application so the "Application Pending" label is not shown.

**Files:**

- `app/frontend/src/components/CharityDashboard.tsx` — add tab nav, import `ProfileView`, `SocialImpactView`, `NotificationDropdown`; remove "Switch to Buyer" button
- `app/frontend/src/App.tsx` — no change needed
- `app/frontend/src/components/ProfileView.tsx` — verify `getMyApplications` behavior for charity role; no logic change expected

---

## 📋 Summary Table

| ID   | Area                                         | Priority | Type    | Status   |
| ---- | -------------------------------------------- | -------- | ------- | -------- |
| B-7  | CharityProfileView white screen crash        | 🔴 High  | Bug     | ✅ Fixed |
| B-8  | DonateModal uses wrong food source           | 🔴 High  | Bug     | ✅ Fixed |
| B-9  | Charity role exclusivity not enforced        | 🔴 High  | Bug     | ✅ Fixed |
| F-9  | Food-only enforcement (UI + API)             | 🔴 High  | Feature | ✅ Fixed |
| F-10 | Buyer-owned food donation flow               | 🔴 High  | Feature | ✅ Fixed |
| F-11 | Charity has no Account Profile / Impact page | 🔴 High  | Feature | 🔲 Open  |

---

## ✅ Resolved / Closed (carry-forward from previous sprint)

| ID  | What happened                                                                              |
| --- | ------------------------------------------------------------------------------------------ |
| B-2 | `CreateCharityPostModal` defaults to `donationMode: 'food'`                                |
| B-4 | `fetch_impact_history` uses two-step query for reliable PostgREST filtering                |
| B-5 | `SocialImpactResponse` model validator relaxed to allow legacy rows                        |
| B-6 | `AdminCharityPosts` uses dedicated admin endpoints (fixes 403 errors)                      |
| F-1 | Charity receives a notification when a new donation is received                            |
| F-2 | Charity can rate a donor after a completed donation                                        |
| F-5 | Marketplace purchases show the post-purchase impact popup reliably                         |
| F-6 | `GET /social_impact/global` endpoint and platform-wide impact banner in `SocialImpactView` |
| F-7 | Charity profile editing includes name, phone, and address fields                           |
| F-8 | Admin can edit/delete charity posts and organizations from the admin panel                 |

---

## 🟢 Nice-to-Have / Future (carry-forward)

| ID  | Description                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------ |
| B-1 | **Money progress bar** — deferred until money donations are enabled.                                         |
| B-3 | **Partner-only donation guard** — deferred.                                                                  |
| F-4 | **Money donation impact tracking** — deferred until money donations are enabled.                             |
| N-1 | **Streak tracking** — needs PM clarification on definition.                                                  |
| N-2 | **More impact badges** — persist current 4 badges to DB for leaderboard support.                             |
| N-3 | **Richer purchase history descriptions** — join `PurchaseItems → Food` to list food names in impact history. |
| N-4 | **Money tab UX** — show "Money donations coming soon" label for money/both mode posts in `DonateModal`.      |
g soon" label for money/both mode posts in `DonateModal`.      |
