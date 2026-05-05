# Version v0.0.10 Documentation

## Quick Diagnostic Read

Version `v0.0.10` completes the backend debugging follow-up for the product-and-safety feature slice. The main outcome is a safer backend boundary: authentication runtime defects were fixed, service-role configuration now fails fast, and dietary-safety relationship replacement now goes through transaction-backed database functions.

You are looking at the correct version if:

- `README.md` shows version `v0.0.10`
- `CHANGELOG.md` has a `v0.0.10` entry
- the repository contains `app/supabase/migrations/20260505000000_product_safety_rpc.sql`
- the backend review document includes a 2026-05-05 debugging completion update

## One-Sentence Objective

Version `v0.0.10` hardens the product-and-safety backend so auth flows resolve correctly, server-side database writes use the intended privileged client, and food/allergy relationship replacement is handled atomically.

## Why This Version Matters

The product-and-safety backend handles allergy-aware food discovery. That means correctness is not only about returning data; it is also about avoiding false-safe food results when relationship writes fail halfway through.

This version addresses the highest-value follow-up risks from the previous review:

- login route code now imports and calls the right dependencies,
- auth service code now imports the server-side database client it already expected to use,
- server-side database access no longer silently falls back to anon privileges,
- food-allergen and user-allergy replacement now has a transactional database boundary,
- focused regression tests document the new service-role and RPC call expectations.

## Plan A / Plan B

### Plan A: Validate In A Prepared Backend Environment

1. Install backend dependencies from `app/backend/requirements.txt`.
2. Apply the Supabase migrations through the local Supabase workflow.
3. Run the backend unittest suite.
4. Exercise the login, product, and safety routes against a local database.

### Plan B: Static Verification First

1. Read `app/backend/api/auth.py` and confirm login uses `auth_service.fetch_user_by_email`.
2. Read `app/backend/database.py` and confirm `SUPABASE_SERVICE_ROLE_KEY` is required.
3. Read `app/backend/services/product_service.py` and confirm relationship replacement calls RPC functions.
4. Read the new migration and confirm the three product-safety RPC functions exist.

Use Plan A when dependencies and Supabase are available. Use Plan B when reviewing the commit before a full local environment is ready.

## System View

```text
app/
  backend/
    api/auth.py                         <- fixed login route dependency and lookup path
    database.py                         <- required Supabase configuration
    services/
      auth_service.py                   <- server-side auth lookups and signup writes
      product_service.py                <- product-safety RPC callers
    tests/
      test_database_config.py           <- service-role config regression test
      test_product_service_atomic_rpc.py <- product-safety RPC call tests
  supabase/
    migrations/
      20260505000000_product_safety_rpc.sql
docs/
  code-review/
    scrutinize-app-backend--issue-10.md <- updated debugging record
  version-0.0.10-docs.md                <- this version note
```

## What Changed In Detail

### Auth Route Fix

The login route previously had runtime problems:

- it used `Depends()` without importing `Depends`,
- it referenced names that were not available inside the login function.

The route now imports `Depends` and resolves the user through `auth_service.fetch_user_by_email(form_data.username)`.

### Server-Side Database Client Fix

Backend-owned operations now consistently use the server-side Supabase client where required:

- auth lookup and signup writes,
- seller profile creation,
- server-created notifications,
- product and user-allergy safety writes.

This matches the backend's role as a trusted API layer while preserving application-level authorization checks in the route and service layers.

### Fail-Fast Supabase Configuration

`app/backend/database.py` now requires:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

If any required value is missing, backend database setup raises a clear configuration error instead of creating a weakened admin client.

### Atomic Product-Safety Writes

The new Supabase migration adds:

- `create_food_with_allergens`
- `replace_food_allergens`
- `replace_user_allergies`

`product_service.py` now calls those RPC functions for the relationship replacement paths that previously required separate delete/insert or parent/child write requests.

### Regression Tests

Two focused test modules were added:

- `test_database_config.py` checks that missing service-role configuration fails clearly.
- `test_product_service_atomic_rpc.py` checks that product and allergy replacement paths call the expected RPC functions.

These tests reduce the risk of accidentally reintroducing anon-key fallback behavior or split relationship writes.

## Acceptance Notes

This version is ready when:

- `README.md` references `v0.0.10`,
- `CHANGELOG.md` has a `v0.0.10` entry,
- the Supabase RPC migration exists,
- the backend review document records the completed debugging pass,
- syntax compilation passes for `app/backend`,
- whitespace checks pass with `git diff --check`.

## Verification Commands

Run these from the repository root:

```powershell
python -m compileall app/backend
git diff --check
```

When backend dependencies are installed, run:

```powershell
cd app/backend
python -m pip install -r requirements.txt
python -m unittest discover tests
```

The previous local validation environment did not have the backend dependencies installed, so unittest discovery failed before executing tests because required imports were unavailable.

## Pitfalls And Debugging

### Backend Fails Immediately At Startup

Check the backend environment values. The service-role key is now required intentionally so configuration problems fail early instead of appearing later as unclear database write failures.

### Product Or Allergy Writes Fail After Pulling This Version

Apply the latest Supabase migration before testing those routes. The backend now expects the product-safety RPC functions to exist in the database.

### Tests Fail Before Any Assertions Run

Install the backend requirements in the Python environment used for the test command. Import failures for FastAPI or environment-loading packages mean the test runner has not reached the application assertions yet.

### Safe-For-User Filtering Looks Wrong

Verify both sides of the relationship:

- the food has the expected food-allergen rows,
- the current user has the expected user-allergy rows.

Then confirm the replacement operation went through the RPC path instead of a split delete/insert sequence.

## Practice Drill

Add one route-level test module for `/products` and `/safety`.

Self-check:

- buyer context can list products and manage its own allergy profile,
- seller context can create and update its own product listings,
- non-seller context cannot create product listings,
- admin context can create allergens,
- non-admin context cannot create allergens.

## Mini Competency Map

- Foundation: Can explain why missing service-role configuration should fail at startup.
- Working: Can trace the login route from request form to user lookup to JWT creation.
- Applied: Can explain why relationship replacement belongs in a transaction-backed database operation.
- Review-ready: Can write route and service tests that protect allergy-aware product discovery from false-safe regressions.

## 24-72 Hour Next Steps

1. Install backend dependencies and run the unittest suite.
2. Apply the new Supabase migration in the local database.
3. Add route tests for product and safety endpoints.
4. Decide whether buyer-facing product discovery should hide expired or zero-stock listings by default.
