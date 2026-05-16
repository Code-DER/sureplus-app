# TODO — Charity, CharityPost & SocialImpact

_Last updated against current codebase. Scope covers `charity_service`, `charity_post_service`,
`social_impact_service` (backend) and `CharityDashboard`, `CharityPostsFeed`, `CharityPostCard`,
`CharityProfileView`, `CharityDirectory`, `DonateModal`, `SocialImpactView`, `AdminCharityPosts` (frontend)._

---

## ✅ Resolved / Closed

| ID  | What happened                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------- |
| F-8 | Admin can now edit/delete charity posts and organizations from the admin panel                                            |
| F-1 | Charity receives a notification when a new donation is received                                                           |
| F-2 | Charity can rate a donor after a completed donation (thumbs up/down with comment)                                         |
| F-5 | Marketplace purchases now show the post-purchase impact popup reliably (with fallback estimation)                         |
| F-6 | New `GET /social_impact/global` endpoint and platform-wide impact banner in `SocialImpactView`                            |
| F-7 | Charity profile editing now includes name, phone, and address fields (proxied to User table)                              |
| B-2 | `CreateCharityPostModal` defaults to `donationMode: 'food'` (matches functional features)                                 |
| B-4 | `fetch_impact_history` uses two-step query for reliable PostgREST filtering                                               |
| B-5 | `SocialImpactResponse` model validator relaxed to allow legacy rows (both IDs None)                                       |
| B-6 | `AdminCharityPosts` now uses dedicated admin endpoints (fixes 403 errors)                                                 |
| F-3 | No longer needed — money/both filter chips are intentionally excluded (food-first scope); food filter chip already exists |
| B-1 | Deferred — money progress bar excluded from current sprint (food-first scope)                                             |
| B-3 | Deferred — partner-only donation guard excluded from current sprint                                                       |
| F-4 | Deferred — money donation impact tracking excluded from current sprint (food-first scope)                                 |

---

## 🔴 Bugs / Correctness Issues

---

## 🟡 Missing Features

---

## 🟢 Nice-to-Have / Future

| ID  | Description                                                                                                                                                                               |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B-1 | **Money progress bar in `CharityPostCard`** — deferred until money donations are enabled. Add `<ProgressBar>` for `money`/`both` mode posts when that sprint begins.                      |
| B-3 | **Partner-only donation guard** — deferred. Add `isPartner` check in `donate_to_post` when the partner system is enforced.                                                                |
| F-4 | **Money donation impact tracking** — deferred until money donations are enabled. Needs PM alignment on kg-equivalent formula before implementing.                                         |
| N-1 | **Streak tracking** — PM mentioned "streaks" for donors. Needs PM clarification on definition.                                                                                            |
| N-2 | **More impact badges** — Current 4 badges are frontend-only. Persisting them to the DB would support leaderboards later.                                                                  |
| N-3 | **Richer purchase history descriptions** — `fetch_impact_history` shows `"Marketplace Purchase"` with no item detail. Join `PurchaseItems → Food` to list food names.                     |
| N-4 | **Money donation tab UX in `DonateModal`** — For posts with `donationMode === 'money'` or `'both'`, show a "Money donations coming soon" label instead of the hidden, non-functional tab. |

---

## 📋 Summary Table

| ID        | Area                              | Priority | Type    | Status              |
| --------- | --------------------------------- | -------- | ------- | ------------------- |
| B-2       | CreateModal default mode          | 🔴 High  | Bug     | ✅ Resolved        |
| B-4       | SocialImpact history query        | 🟠 Med   | Bug     | ✅ Resolved        |
| B-5       | SocialImpact model validator      | 🟠 Med   | Bug     | ✅ Resolved        |
| B-6       | Admin panel 403 on post actions   | 🔴 High  | Bug     | ✅ Resolved        |
| F-1       | Donation notification             | 🔴 High  | Feature | ✅ Resolved        |
| F-2       | Charity rating of donors          | 🟠 Med   | Feature | ✅ Resolved        |
| F-5       | Purchase impact popup             | 🟠 Med   | Feature | ✅ Resolved        |
| F-6       | Global impact endpoint            | 🟡 Low   | Feature | ✅ Resolved        |
| F-7       | Charity profile editing           | 🟡 Low   | Feature | ✅ Resolved        |
| F-8       | Admin edit/delete charity content | 🔴 High  | Feature | ✅ Resolved        |
| B-1       | Money progress bar                | —        | Future  | ⏳ Deferred         |
| B-3       | Partner donation guard            | —        | Future  | ⏳ Deferred         |
| F-3       | Money/both filter chips           | —        | Closed  | ✅ N/A (food-first) |
| F-4       | Money donation impact             | —        | Future  | ⏳ Deferred         |
| F-8 (old) | Edit post image confirm           | —        | Verify  | ✅ Confirmed        |
| N-1       | Streaks                           | 🟡 Low   | Future  | ⏳ Deferred         |
| N-2       | More badges                       | 🟡 Low   | Future  | ⏳ Deferred         |
| N-3       | History detail                    | 🟡 Low   | Future  | ⏳ Deferred         |
| N-4       | Money tab UX                      | 🟡 Low   | Polish  | ⏳ Deferred         |

---

## ✅ Fully Implemented (for reference)

- Charity CRUD: list all, fetch profile (User join), update `organizationName`, toggle partner status
- CharityPost CRUD with ownership checks on update/delete
- `donationMode` (money / food / both) with DB-level check constraint
- Atomic donation RPCs (`donate_money_to_post`, `donate_food_to_post`) with goal-capping and auto-`funded` status
- Food donation social impact computation (CO₂, kg rescued, meals)
- `SocialImpactView` — per-user summary, contribution timeline, static badges
- `CharityPostsFeed` — public feed with search, status filter, food-mode filter, infinite scroll
- `CharityDashboard` — stats bar, create/edit/delete posts, load more pagination
- `CharityPostCard` — food progress bar, partner badge, mode badge, owner actions, donation history drawer
- `CharityProfileView` + `CharityDirectory`
- `DonateModal` — food donation flow with post-donation `OrderSuccessModal`
- `EditCharityPostModal` — full image upload, title/description/goal/status editing ✅
- `AdminCharityPosts` — full moderation (edit/delete/status) using dedicated admin endpoints ✅
- Admin partner-tagging toggle for charities (`PUT /admin/charities/{user_id}/partner`)
- Charity application → admin approve/reject workflow
- Image upload to `charity_images` Supabase Storage bucket
- Buyer notification on purchase impact creation
