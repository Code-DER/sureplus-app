# TODO — Charity, CharityPost & SocialImpact Scope

> Cross-referenced against `Features_to_Implement.pdf`.  
> Each item is tagged with its source: **[PDF]** = required by the feature spec, **[UX]** = UX improvement, **[BUG]** = existing defect.

---

## 1. Feature Compliance Gaps (PDF vs. Codebase)

### 1.1 Charity Post — Image Upload

**[PDF]** The spec states charity posts can include a picture alongside their description and target amount.

- `CharityPost` table and `CharityPostCreate` model have **no image field**.
- **TODO:** Add an `imageUrl` (or `imageBase64`) column to `CharityPost`. Update `CharityPostCreate`, `CharityPostResponse`, and `CharityPostUpdate` models. Add image upload UI to the create/edit post modal in `CharityDashboard`. Display the image in `CharityPostCard` and `CharityProfileView`.

---

### 1.2 Charity Post — 1000-Character Description Limit

**[PDF]** Spec says description has a maximum of 1000 characters.

- `CharityPostCreate.description` is `Optional[str]` with no length constraint.
- **TODO:** Add `Field(max_length=1000)` to `description` in `CharityPostCreate` and `CharityPostUpdate`. Add a live character counter (`{n}/1000`) in the post creation/edit modal UI.

---

### 1.3 Charity Rating — Rate Donor & Rider After Transaction

**[PDF]** After each completed transaction, charity should be able to rate the donor and rider (thumbs up/down + short comment, max characters).

- No rating flow exists anywhere for the charity role. `CharityDashboard` shows no donation history and no rating prompts.
- **TODO:**
  1. Add a `GET /charity-posts/{post_id}/donations` endpoint that returns completed donations for the charity's own post (for the charity's eyes only).
  2. Create a `DonationHistory` panel in `CharityDashboard` listing recent donations with donor info.
  3. Build a `RateUserModal` (reusable or charity-specific) that submits a thumbs-up/down + comment.
  4. Add a `POST /ratings/` endpoint (or extend the existing rating system) to handle charity-submitted ratings for donors.

---

### 1.4 Social Impact Popup — After Every Purchase

**[PDF]** Feature #5 explicitly states: _"must also be a pop-up every after purchase is made regarding how much environmental impact they created just by buying."_

- There is a `SocialImpactView` page but **no post-purchase popup** is triggered anywhere in the buyer flow.
- **TODO:**
  1. After a successful purchase confirmation, fetch the `SocialImpact` record for that `purchaseID` from `GET /social-impact/purchase/{purchase_id}`.
  2. Display a `PurchaseImpactModal` (or toast/sheet) showing rescued kilos, CO₂ offset, and people fed for that specific transaction.
  3. Wire this modal into the buyer's checkout success flow.

---

### 1.5 Social Impact Popup — After Every Food Donation

**[PDF]** Same logic as above applies to donations — users should see their impact after donating food.

- `create_food_donation_impact()` exists in `social_impact_service.py` and the DB schema supports it (FD-7 migration), but there is **no popup** surfaced after a food donation is submitted via `DonateModal`.
- **TODO:**
  1. After a successful food donation in `DonateModal`, call `GET /social-impact/donation/{donation_id}` (endpoint does not exist yet — must be created).
  2. Show the same `PurchaseImpactModal` / impact sheet reused from 1.4 above.
  3. Add `GET /social-impact/donation/{donation_id}` endpoint to `social_impact.py` (with ownership check: only the donor can see it).

---

### 1.6 SocialImpact Model Missing `donationID`

**[BUG]** The DB schema (FD-7 migration) adds `donationID` to `SocialImpact`, but the Pydantic model `SocialImpactResponse` in `models/social_impact.py` still only has `purchaseID` and does not expose `donationID`.

- **TODO:** Add `donationID: Optional[UUID] = None` to `SocialImpactResponse`. Make `purchaseID: Optional[UUID] = None` as well (it is now nullable per the DB constraint). Add a validator ensuring exactly one of `purchaseID` or `donationID` is set.

---

### 1.7 SocialImpact Summary — Donation Impact Not Displayed

**[PDF + UX]** The backend `fetch_summary_by_user` already aggregates both purchase-based and donation-based impact, but `SocialImpactView` only shows aggregate totals with no breakdown.

- **TODO:**
  1. Update `SocialImpactSummary` model to include `donationCount: int` and optionally `donationRescuedKilos: float`.
  2. Update `SocialImpactView` to show separate stat cards (or sub-sections) for _"From Purchases"_ vs _"From Donations"_, so users understand both contribution paths.

---

### 1.8 Charity Application — SEC Registration Field

**[PDF]** Comments in the spec (Image 4) say charity verification requires SEC registration number in addition to a government-issued ID. The admin team verifies these.

- `CharityApplication` currently only has `govID` and `purpose`.
- **TODO:** Add an optional `secRegistration: Optional[str]` field to `CharityApplicationCreate` and the `CharityApplication` DB table. Display both fields in `AdminCharityApplications` for admin review.

---

### 1.9 Admin — Tag Charity as Partner

**[PDF]** Admin should be able to tag/untag charities as "partners" at any time (partner charities are the only beneficiaries of donations or free food).

- **TODO:** Confirm whether a `isPartner` flag exists on the `Charity` table. If not, add `isPartner BOOLEAN DEFAULT FALSE` to the `Charity` table. Add `PUT /admin/charities/{user_id}/partner` endpoint. Add a toggle in `AdminCharityApplications` or a dedicated admin charity management page. Display a "Partner" badge on `CharityPostCard` and `CharityProfileView` for partner charities.

---

### 1.10 Money Donations — Scope Alignment

**[PDF]** The spec marks _"accept monetary donations"_ as **No** — _"No money transaction for this time being."_

- The backend fully supports money donations (FD-1 migration, `donate_money_to_post` RPC, `DonateModal` money tab).
- **TODO (decision):** Either (a) disable the money tab in `DonateModal` until the feature is officially unlocked (hide tab, show "Coming soon" note), or (b) confirm with the team that money donations are intentionally being built ahead of schedule and document this. Do not remove the backend code either way.

---

## 2. UX Improvements

### 2.1 CharityDashboard — Aggregate Stats Panel

**[UX]** The dashboard shows only a list of posts with no high-level numbers.

- **TODO:** Add a stats bar at the top of `CharityDashboard` showing: _Total Raised (₱)_, _Total Food Donated (kg)_, _Active Posts_, and _Funded Posts_. Derive these from the posts already fetched.

---

### 2.2 CharityDashboard — Post Status Management

**[UX]** Charities cannot manually close or reopen a post from the dashboard UI. Only "edit" and "delete" buttons are present.

- **TODO:** Add a "Close Post" / "Reopen Post" action button (or dropdown) per post card in `CharityDashboard`. Wire it to `PUT /charity-posts/{id}` with `{ status: 'closed' }` or `{ status: 'active' }`.

---

### 2.3 CharityDashboard — Donation History Per Post

**[UX]** Charities have no visibility into who donated to their posts or when.

- **TODO:** Add an expandable "Donations" section per post card in `CharityDashboard` (collapsed by default, loaded on demand). Show donor name (or "Anonymous"), donation type, amount/quantity, and date.

---

### 2.4 CharityPostsFeed — Filter by Donation Mode and Status

**[UX]** Users browsing charity posts cannot filter by `donationMode` (money/food/both) or `status` (active/funded/closed).

- **TODO:** Add filter chips or a dropdown in `CharityPostsFeed` for: _All / Money / Food / Both_ and _Active / Funded / Closed_. Pass these as query params to `GET /charity-posts/`.
- Also update `charity_post_service.fetch_all_posts()` and the API endpoint to accept and apply `donation_mode` and `status` filters.

---

### 2.5 CharityPostCard — "Funded" Celebration State

**[UX]** When a post reaches 100% of its goal, it silently shows `status: funded` with no positive feedback.

- **TODO:** When `currentAmount >= amountNeeded` or `currentFoodKg >= foodGoalKg`, show a distinct visual treatment on `CharityPostCard` (e.g., green banner, confetti animation, "Goal Reached 🎉" badge). Disable the Donate button when all goals are met.

---

### 2.6 DonateModal — Impact Preview for Money Donations

**[UX]** The food tab shows a weight-based impact estimate (kg rescued, CO₂). The money tab shows nothing similar.

- **TODO:** For money donations, estimate and display how much food the donated amount could help rescue (based on average price per kg, if available) or at least show a simple motivational line like _"Every ₱50 helps rescue approximately 1 kg of food."_

---

### 2.7 DonateModal — Confirmation Step

**[UX]** Clicking "Donate" immediately submits the donation with no confirmation step.

- **TODO:** Add a confirmation screen/step inside `DonateModal` showing a summary (post title, donation type, amount/food item + quantity) with "Confirm" and "Back" buttons before the final API call.

---

### 2.8 DonateModal — Clearer Food Item Picker

**[UX]** The food picker loads all in-stock edible food items globally with no context about what the charity actually needs.

- **TODO:**
  1. Show the food item's `weightKg`, `expiryDate`, and seller name in the picker to help donors make informed choices.
  2. If the charity post has a description of needed food types, surface it as a hint above the picker.
  3. Sort available items by soonest expiry first (most urgent to rescue).

---

### 2.9 CharityPostsFeed — "Load More" vs. Infinite Scroll UX

**[UX]** The "Load More" button appears even when there may be no more posts (until the button is clicked and returns 0 results). Also, on mobile, this button can be hard to find.

- **TODO:** Hide the "Load More" button when `hasMore` becomes false. Consider switching to intersection observer-based infinite scroll for a smoother experience.

---

### 2.10 CharityProfileView — Email Privacy

**[UX]** `CharityProfileView` displays the charity's personal `emailAddress` publicly to all users.

- **TODO:** Hide the email address from the public profile view. Only show the organization name, contact person's name, and optionally a contact-via-message button (if a messaging feature is planned). Alternatively, show a masked version like `p***@email.com`.

---

### 2.11 CharityProfileView — Impact Stats for the Charity Org

**[UX]** A charity's public profile shows only their posts. Donors have no sense of the charity's overall impact or track record.

- **TODO:** Add a summary row to `CharityProfileView` showing: _Total Donations Received (₱)_, _Total Food Received (kg)_, _Active Campaigns_, and _Funded Campaigns_. Derive from the posts already fetched client-side.

---

### 2.12 SocialImpactView — Historical Contribution Timeline

**[UX]** The impact view shows only lifetime totals with no history or timeline, making it feel static.

- **TODO:** Add a scrollable list of recent impact events (purchases and food donations) beneath the stat cards, showing date, item, and per-event impact metrics (rescued kg, CO₂, people fed). Fetch from `GET /social-impact/summary` extended with a `history` field or a separate `GET /social-impact/history` endpoint.

---

### 2.13 SocialImpactView — Badges / Milestones

**[PDF + UX]** The spec mentions badges to incentivize rescuers (Feature #5 and buyer-specific features). `SocialImpactView` is the natural home for this.

- **TODO:** Define badge tiers (e.g., _"First Rescue"_, _"10 kg Rescued"_, _"50 kg Eco-Hero"_). Display earned badges in `SocialImpactView`. Store badge state client-side (derived from summary totals) — no new DB table needed for MVP.

---

### 2.14 Admin — Charity Post Moderation

**[UX]** There is no admin view for reviewing or moderating charity posts (e.g., flagging fake/spam campaigns).

- **TODO:** Add a read-only charity post list to the admin panel (`AdminCharityApplications` page or a new `AdminCharityPosts` component). Allow admins to mark a post as `closed` or remove it.

---

## 3. Backend / API Hardening

### 3.1 `donate_food_to_post` — Verify `create_food_donation_impact` Is Called

**[BUG]** The `charity_post_service.donate_food()` method calls the `donate_food_to_post` RPC, but it is not confirmed that `social_impact_service.create_food_donation_impact()` is invoked afterwards in `charity_posts.py`.

- **TODO:** In the `/charity-posts/{id}/donate` endpoint handler, after a successful food donation, call `social_impact_service.create_food_donation_impact(donation_id, rescued_kg)`. Wrap in a try/except so a failure to record impact does not roll back the donation itself.

---

### 3.2 Add `GET /social-impact/donation/{donation_id}` Endpoint

**[PDF]** Required for the post-donation popup (see item 1.5).

- **TODO:** Add `@router.get("/donation/{donation_id}", response_model=SocialImpactResponse)` to `social_impact.py`. Add ownership check: only the donor (`Donation.userID == current_user.userID`) can retrieve the record.

---

### 3.3 `SocialImpactSummary` — Include Donation Count

**[UX]** The summary model only has `purchaseCount`. Donors who give food but never buy see a zero count, hiding their real contributions.

- **TODO:** Add `donationCount: int` (food donations only) to `SocialImpactSummary`. Update `fetch_summary_by_user()` to return this field.

---

### 3.4 CharityPost Pagination on `fetch_posts_by_user`

**[UX]** `fetch_posts_by_user` returns all posts for a user with no limit/offset. A charity with many old posts could cause slow loads.

- **TODO:** Add `limit` and `offset` params to `fetch_posts_by_user` service and the `GET /charity-posts/by-user/{user_id}` endpoint. Update the callers (`CharityDashboard`, `CharityProfileView`) to paginate or lazy-load.

---

## 4. Quick Wins (Low Effort, High Value)

| #   | Task                                                                                        | File(s)                   |
| --- | ------------------------------------------------------------------------------------------- | ------------------------- |
| Q1  | Add `max_length=1000` to `CharityPostCreate.description`                                    | `models/charity_post.py`  |
| Q2  | Show live char counter in create/edit post modal                                            | `CharityDashboard.tsx`    |
| Q3  | Disable Donate button when post `status === 'funded'` or `status === 'closed'`              | `CharityPostCard.tsx`     |
| Q4  | Add `donationMode` badge chip to `CharityPostCard` (e.g., "💰 Money", "🥕 Food", "🤝 Both") | `CharityPostCard.tsx`     |
| Q5  | Show "Goal Reached 🎉" banner overlay on funded `CharityPostCard`                           | `CharityPostCard.tsx`     |
| Q6  | Add `donationID: Optional[UUID]` to `SocialImpactResponse`                                  | `models/social_impact.py` |
| Q7  | Hide charity email on public `CharityProfileView`                                           | `CharityProfileView.tsx`  |
| Q8  | Add `purchaseCount` label to `SocialImpactView` ("from X rescues")                          | `SocialImpactView.tsx`    |

---

## 5. Out of Scope (Per PDF) — Do Not Implement

- Monetary donations to charity (`c. Should be able to accept monetary donations`) — marked **No** in spec. Backend code exists but should remain hidden from UI until approved.
- Rider-specific flows for charity deliveries — marked **No** (App 4 - Rider entirely not in scope).
- Subscription fees / premium buyer features tied to charity content — **TBD/No**.
