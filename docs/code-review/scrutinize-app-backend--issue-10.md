# Backend Product and Safety Review - Issue 10

## Quick Diagnostic Read

This report reviews the `app/backend` product-and-safety implementation for issue #10 after the authentication hardening update. Issue #10 is scoped to the `Food`, `Allergen`, `FoodAllergen`, and `UserAllergies` data model surfaces.

The review focused on:

- FastAPI route registration and route-level authorization for product and safety endpoints.
- JWT verification, role revalidation, and backend Supabase client configuration.
- Product, allergen, food-allergen, and user-allergy service behavior.
- Available backend test coverage for the new product and safety workflows.

The initial review did not execute runtime tests, HTTP requests, database connections, linter runs, or static analyzers. The 2026-05-05 debugging update adds local syntax validation and diff checks, but live Supabase verification is still pending.

## One-Sentence Objective

Decide whether the issue #10 backend slice is ready for integration, identify confirmed risks, and name the smallest follow-up actions needed before merge.

## Debugging Completion Update - 2026-05-05

### Symptom Summary

The issue #10 backend slice was implemented, but static debugging showed three concrete failure classes before closure:

- the auth router could fail during app import or login execution because `Depends` was not imported and the login handler referenced undefined names;
- auth signup/login service functions referenced `supabase_admin` without importing it;
- product/allergy relationship writes were multi-step, so partial writes could leave dietary-safety state inconsistent.

This update is based on repository inspection and local syntax checks, not live Supabase requests.

### Evidence Summary

Observed facts:

- `app/backend/api/auth.py` used `Depends()` in the login route default argument without importing `Depends`.
- `app/backend/api/auth.py` referenced `supabase` and `user_input` inside login even though neither name was available in that function.
- `app/backend/services/auth_service.py` called `supabase_admin` in `create_user`, `fetch_user_by_email`, and `fetch_user_auth_context` but imported only `supabase`.
- `app/backend/database.py` created `supabase_admin` with `service_key or key`, silently downgrading the admin client to anon privileges when `SUPABASE_SERVICE_ROLE_KEY` was missing.
- `app/backend/services/product_service.py` separately inserted `Food`, deleted/inserted `FoodAllergen`, and deleted/inserted `UserAllergies` rows.

### Root Cause

The primary root cause was an incomplete backend hardening pass: server-side code depended on a service-role Supabase client, but configuration loading, auth imports, and product-safety relationship writes were not made consistent with that contract.

### Fix Applied

Changed files:

- `app/backend/database.py`: added fail-fast environment validation and removed the anon-key fallback for `supabase_admin`.
- `app/backend/api/auth.py`: fixed the login route imports and delegated email lookup to `auth_service.fetch_user_by_email`.
- `app/backend/services/auth_service.py`: imported and used `supabase_admin` for auth lookup/signup writes.
- `app/backend/services/user_service.py`: uses `supabase_admin` when creating seller profiles.
- `app/backend/services/notification_service.py`: uses `supabase_admin` for server-created notifications.
- `app/backend/services/product_service.py`: replaced multi-step food/allergy replacement calls with RPC calls.
- `app/supabase/migrations/20260505000000_product_safety_rpc.sql`: added transaction-backed `create_food_with_allergens`, `replace_food_allergens`, and `replace_user_allergies` RPC functions.
- `app/backend/tests/test_database_config.py`: added a service-role missing-config regression test.
- `app/backend/tests/test_product_service_atomic_rpc.py`: added focused service tests for the atomic RPC call paths.

### Validation

Completed locally:

- `python -m compileall app/backend` passed.
- `git diff --check` passed.

Blocked locally:

- `python -m unittest discover app/backend/tests` could not run in this machine's current Python environment because backend dependencies are not installed (`fastapi` and `python-dotenv` imports failed before tests could execute).

### Remaining Unknowns / Follow-Up

- Apply the new Supabase migration before exercising product/safety writes against a database.
- Run the backend test suite in an environment with `app/backend/requirements.txt` installed.
- Add broader route tests for `/products` and `/safety` when the local dependency environment is available.
- Clarify whether buyer-facing product discovery should hide expired or zero-stock listings by default.

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
- `tests/test_database_config.py` covers missing service-role configuration fail-fast behavior.
- `tests/test_product_service_atomic_rpc.py` covers the atomic RPC call paths for product creation, food-allergen replacement, and user-allergy replacement.
- No route tests currently exercise product routes, safety routes, seller/admin route gates, safe-for-user filtering, expired listing behavior, or zero-stock listing behavior.

## Findings Ordered By Severity

### Critical

No Critical findings were confirmed.

### High

No High findings remain confirmed after the 2026-05-05 debugging pass.

The previous JWT trust-boundary concern is addressed by signing and verifying application tokens with `JWT_SECRET_KEY` and by revalidating the token role against the current database user role before protected route logic runs.

#### H1. Auth router and auth service runtime defects are fixed

Confidence: resolved by code inspection and syntax validation.

Locations:

- `app/backend/api/auth.py`
- `app/backend/services/auth_service.py`

Observed fact:

The auth router previously used `Depends()` without importing `Depends`, and the login handler referenced undefined `supabase` and `user_input` names. `auth_service.py` also referenced `supabase_admin` without importing it.

Resolution:

`api/auth.py` now imports `Depends` and uses `auth_service.fetch_user_by_email(form_data.username)`. `auth_service.py` imports and uses `supabase_admin`.

### Medium

#### M1. Multi-step product and allergy writes can leave partial dietary-safety state

Confidence: resolved by code inspection and syntax validation.

Locations:

- `app/backend/services/product_service.py`
- `app/supabase/migrations/20260425000000_initial_schema.sql`

Original observed fact:

`create_food` inserts a `Food` row and then separately inserts `FoodAllergen` rows. `update_food` deletes `FoodAllergen` rows and then separately inserts replacements. `replace_user_allergies` deletes all `UserAllergies` rows and then separately inserts replacements. These operations are not wrapped in a transaction or database RPC.

Impact:

If the second request fails after the first request succeeds, a food listing can be missing allergen tags, or a user can temporarily or permanently lose allergy rows. Since safe-for-user filtering depends on those relationships, partial state can create false-safe product results.

Resolution:

`product_service.py` now calls transaction-backed Postgres RPC functions for `create_food_with_allergens`, `replace_food_allergens`, and `replace_user_allergies`. The migration is stored at `app/supabase/migrations/20260505000000_product_safety_rpc.sql`.

Validating test/check:

Added focused service tests for the RPC call paths. A live database check should still be run after applying the migration.

#### M2. `supabase_admin` silently falls back to the anon key when the service-role key is missing

Confidence: resolved by code inspection and syntax validation.

Locations:

- `app/backend/database.py`
- `app/backend/.sample.env`
- `app/supabase/migrations/20260425000000_initial_schema.sql`

Original observed fact:

`database.py` reads `SUPABASE_SERVICE_ROLE_KEY`, but constructs `supabase_admin` with `service_key or key`. If `SUPABASE_SERVICE_ROLE_KEY` is absent, the backend silently uses `SUPABASE_ANON_KEY` for the admin client. The issue #10 service methods then call `supabase_admin` for writes.

Impact:

With a missing service-role key, product and user-allergy writes are likely to fail under RLS because the anon client does not carry the authenticated user's Supabase JWT and the schema policies depend on `auth.uid()`. The application starts successfully, but issue #10 writes fail later and unclearly.

Resolution:

`database.py` now raises `BackendConfigurationError` when `SUPABASE_URL`, `SUPABASE_ANON_KEY`, or `SUPABASE_SERVICE_ROLE_KEY` is missing, and `supabase_admin` is created only with the service-role key.

Validating test/check:

Added `app/backend/tests/test_database_config.py` for the missing service-role key path.

#### M3. Product and safety route/service behavior remains mostly untested

Confidence: partially reduced validation gap.

Locations:

- `app/backend/tests/test_auth_dependency.py`
- `app/backend/api/products.py`
- `app/backend/api/safety.py`
- `app/backend/services/product_service.py`

Original observed fact:

The current tests cover the authentication dependency only. They do not cover `/products`, `/safety`, seller/admin route gates, safe-for-user filtering, allergen ID validation through service methods, product ownership checks, duplicate allergen behavior, service-role missing-env behavior, or partial relationship-write failures.

Impact:

The highest-risk authentication boundary has direct regression coverage, but the main issue #10 product and safety workflows can still regress without a failing test. The most important untested behavior is safe-for-user filtering fed by `FoodAllergen` and `UserAllergies`.

Resolution:

Added focused tests for database configuration fail-fast behavior and atomic product/user-allergy RPC usage.

Smallest remaining safe fix direction:

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
2. `database.py` now fails fast when the service-role key is missing; deployments must provide `SUPABASE_SERVICE_ROLE_KEY`.
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
- Residual risk is operational and validation oriented: the new RPC migration must be applied, and route-level product/safety tests still need to be run in an environment with backend dependencies installed.

## Top Risks

1. The new Supabase RPC migration must be applied before product/safety writes are exercised against a real database.
2. Product/safety workflows still need broader route-level regression coverage.
3. Product discovery semantics for expired and zero-stock listings remain an open product-contract question.

## Missing Tests And Validation Gaps

No route or live-database tests currently cover:

- seller-only product writes,
- admin-only allergen creation,
- safe-for-user filtering,
- rollback behavior inside the new product-safety RPCs,
- expired listing behavior,
- zero-stock listing behavior.

## Recommended Smallest Next Action

Install backend requirements in the local Python environment, run `python -m unittest discover app/backend/tests`, and then apply `app/supabase/migrations/20260505000000_product_safety_rpc.sql` to the target Supabase database.

## Verification Notes

The 2026-05-05 debugging pass completed:

- `python -m compileall app/backend` passed.
- `git diff --check` passed.
- `python -m unittest discover app/backend/tests` could not run in the current Python environment because backend dependencies are not installed; imports failed for `fastapi` and `python-dotenv`.
