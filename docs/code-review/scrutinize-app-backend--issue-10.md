# Backend Product and Safety Review - Issue 10

## Quick Diagnostic Read

This report reviews the `app/backend` product-and-safety implementation for issue #10 after the authentication hardening update. Issue #10 is scoped to the `Food`, `Allergen`, `FoodAllergen`, and `UserAllergies` data model surfaces.

The review focused on:

- FastAPI route registration and route-level authorization for product and safety endpoints.
- JWT verification, role revalidation, and backend Supabase client configuration.
- Product, allergen, food-allergen, and user-allergy service behavior.
- Available backend test coverage for the new product and safety workflows.

No runtime tests, HTTP requests, database connections, linter runs, or static analyzers were executed as part of this report. The findings below are based on static code review.

## One-Sentence Objective

Decide whether the issue #10 backend slice is ready for integration, identify confirmed risks, and name the smallest follow-up actions needed before merge.

## Why This Area Matters

The `app/backend` package owns authentication, product listing management, allergen catalog management, and allergy-aware filtering. For issue #10, the largest behavioral risk is dietary-safety correctness: if `FoodAllergen` or `UserAllergies` state is incomplete or stale, food that should be unsafe for a user can appear safe.

Authorization also matters because sellers can create and update inventory, admins can create allergens, and the service layer performs server-side writes against tables protected by Row Level Security policies.

## Review Surface

Primary files:

- `app/backend/main.py`
- `app/backend/api/products.py`
- `app/backend/api/safety.py`
- `app/backend/api/auth.py`
- `app/backend/api/dependency.py`
- `app/backend/database.py`
- `app/backend/services/product_service.py`
- `app/backend/services/auth_service.py`
- `app/backend/models/product.py`
- `app/backend/tests/test_auth_dependency.py`

Supporting context:

- `app/backend/.sample.env`
- `app/backend/requirements.txt`
- `app/supabase/migrations/20260425000000_initial_schema.sql`

## Entry Points, Trust Boundaries, And Test Surfaces

Entry points:

- `main.py` registers `/users`, `/auth`, `/products`, and `/safety`.
- `api/products.py` exposes listing, create, get, patch, and delete operations for food records.
- `api/safety.py` exposes allergen catalog reads and writes plus current-user allergy management.
- `api/auth.py` exposes signup and login, and issues bearer tokens consumed by protected routes.

Trust boundaries:

- `api/dependency.py` verifies application JWTs using `JWT_SECRET_KEY`, requires `sub` and `role`, and re-fetches the current database role before returning an authenticated user context.
- `api/products.py` gates product writes to sellers.
- `api/safety.py` gates allergen creation to admins.
- `database.py` constructs both anon and server-side Supabase clients.
- `product_service.py` performs product, allergen, and user-allergy writes through the server-side client.

Test surfaces:

- `tests/test_auth_dependency.py` covers anon-key-signed token rejection, token/database role mismatch rejection, and matched-role success.
- No tests currently exercise product routes, safety routes, product service behavior, user-allergy replacement, safe-for-user filtering, service-role configuration failure, expired listing behavior, or zero-stock listing behavior.

## Findings Ordered By Severity

### Critical

No Critical findings were confirmed.

### High

No High findings remain confirmed.

The previous JWT trust-boundary concern is addressed by signing and verifying application tokens with `JWT_SECRET_KEY` and by revalidating the token role against the current database user role before protected route logic runs.

### Medium

#### M1. Multi-step product and allergy writes can leave partial dietary-safety state

Confidence: confirmed design defect.

Locations:

- `app/backend/services/product_service.py`
- `app/supabase/migrations/20260425000000_initial_schema.sql`

Observed fact:

`create_food` inserts a `Food` row and then separately inserts `FoodAllergen` rows. `update_food` deletes `FoodAllergen` rows and then separately inserts replacements. `replace_user_allergies` deletes all `UserAllergies` rows and then separately inserts replacements. These operations are not wrapped in a transaction or database RPC.

Impact:

If the second request fails after the first request succeeds, a food listing can be missing allergen tags, or a user can temporarily or permanently lose allergy rows. Since safe-for-user filtering depends on those relationships, partial state can create false-safe product results.

Smallest safe fix direction:

Move relationship replacement into transaction-backed Postgres RPC functions such as `create_food_with_allergens`, `replace_food_allergens`, and `replace_user_allergies`, then call those RPCs from `product_service.py`.

Validating test/check:

Add a failure-injection test where relationship insert fails after parent insert/delete and verify the prior safety state remains intact or the whole operation rolls back.

#### M2. `supabase_admin` silently falls back to the anon key when the service-role key is missing

Confidence: confirmed defect.

Locations:

- `app/backend/database.py`
- `app/backend/.sample.env`
- `app/supabase/migrations/20260425000000_initial_schema.sql`

Observed fact:

`database.py` reads `SUPABASE_SERVICE_ROLE_KEY`, but constructs `supabase_admin` with `service_key or key`. If `SUPABASE_SERVICE_ROLE_KEY` is absent, the backend silently uses `SUPABASE_ANON_KEY` for the admin client. The issue #10 service methods then call `supabase_admin` for writes.

Impact:

With a missing service-role key, product and user-allergy writes are likely to fail under RLS because the anon client does not carry the authenticated user's Supabase JWT and the schema policies depend on `auth.uid()`. The application starts successfully, but issue #10 writes fail later and unclearly.

Smallest safe fix direction:

Fail fast during backend startup or configuration loading if `SUPABASE_URL`, `SUPABASE_ANON_KEY`, or `SUPABASE_SERVICE_ROLE_KEY` is missing. Do not silently downgrade `supabase_admin` to anon privileges.

Validating test/check:

Add a config test that clears `SUPABASE_SERVICE_ROLE_KEY` and asserts database client setup fails with an explicit configuration error before route handlers run.

#### M3. Product and safety route/service behavior remains mostly untested

Confidence: confirmed validation gap.

Locations:

- `app/backend/tests/test_auth_dependency.py`
- `app/backend/api/products.py`
- `app/backend/api/safety.py`
- `app/backend/services/product_service.py`

Observed fact:

The current tests cover the authentication dependency only. They do not cover `/products`, `/safety`, seller/admin route gates, safe-for-user filtering, allergen ID validation through service methods, product ownership checks, duplicate allergen behavior, service-role missing-env behavior, or partial relationship-write failures.

Impact:

The highest-risk authentication boundary has direct regression coverage, but the main issue #10 product and safety workflows can still regress without a failing test. The most important untested behavior is safe-for-user filtering fed by `FoodAllergen` and `UserAllergies`.

Smallest safe fix direction:

Add one route-level test module for `/products` and `/safety` with dependency overrides for buyer, seller, and admin contexts. Add one service-level test module using fake Supabase query objects for `list_foods`, `update_food`, and `replace_user_allergies`.

Validating test/check:

Run `python -m unittest discover app/backend/tests` in an environment with backend requirements installed and confirm route/service tests fail on authorization or safety regressions.

### Low

#### L1. Product discovery defaults may expose expired or unavailable listings

Confidence: open question.

Locations:

- `app/backend/api/products.py`
- `app/backend/services/product_service.py`
- `app/supabase/migrations/20260425000000_initial_schema.sql`

Observed fact:

`list_foods` defaults `include_expired=True` and does not filter `stockQuantity > 0`. It only filters expiration when callers pass `include_expired=False`.

Impact:

If `/products` is intended as buyer-facing discovery, expired or zero-stock foods can appear by default. If it is intended as a seller/admin catalog endpoint, the default may be acceptable. The code does not state which contract is intended.

Smallest safe fix direction:

Clarify endpoint semantics. For buyer discovery, add an `available_only` default that filters out expired and zero-stock listings. For seller/admin catalog use, keep broad listing behavior but expose a separate buyer discovery route.

Validating test/check:

Add tests for expired, null-expiration, zero-stock, and positive-stock listings under the chosen default contract.

## Cross-File Contract Risks

1. Protected requests now depend on database role revalidation. This is a good security tradeoff, but failure behavior and latency should be validated.
2. `database.py` exposes `supabase_admin`, while `product_service.py` assumes it has service-role privileges. The anon-key fallback breaks that implicit contract.
3. `models/product.py` requires `description`, `picture`, and `expirationDate` on create, while the migration permits nullable values. This stricter API contract may be intentional, but imported or legacy rows can still return null values.
4. `auth_service.py` creates role-extension rows after inserting `User`. If a role-extension insert fails, a user can exist without the extension row expected by product or admin flows.
5. The auth dependency tests do not prove that FastAPI route wiring rejects forged or stale-role tokens at the `/products` and `/safety` endpoints.

## Security Status

Primary security-sensitive regions:

- JWT signing and verification in `auth_service.py` and `dependency.py`.
- Database role revalidation in `auth_service.py` and `dependency.py`.
- Role-gated issue #10 routes in `products.py` and `safety.py`.
- Service-role database access in `database.py` and `product_service.py`.
- User-sensitive allergy data in `product_service.py`.

Status:

- The previously identified forged-token path using `SUPABASE_ANON_KEY` is addressed in code and has direct dependency tests.
- No new Critical or High security finding was confirmed from static evidence.
- Residual risk is operational and data-consistency oriented: missing service-role configuration currently fails late, and multi-step relationship writes can produce partial safety state.

## Top Risks

1. Non-atomic allergen relationship writes can make unsafe food appear safe after partial failure.
2. Missing service-role configuration can make issue #10 writes fail later and unclearly under RLS.
3. Product/safety workflows still lack route and service regression coverage.

## Missing Tests And Validation Gaps

No route or service tests currently cover:

- seller-only product writes,
- admin-only allergen creation,
- safe-for-user filtering,
- allergen relationship replacement failure,
- user-allergy replacement failure,
- missing service-role configuration,
- expired listing behavior,
- zero-stock listing behavior.

## Recommended Smallest Next Action

Make `SUPABASE_SERVICE_ROLE_KEY` mandatory in `database.py` and fail fast instead of falling back to the anon key.

## Verification Notes

This report did not execute tests or runtime checks. The previously reported local verification for the implementation was:

- `python -m compileall app/backend` passed.
- `git diff --check` passed.
- FastAPI/OpenAPI import checking could not run because the current Python environment did not have `fastapi` installed.
