# Version v0.0.8 Documentation

## Quick Diagnostic Read

Version `v0.0.8` adds the first committed FastAPI backend feature slice for product inventory and dietary safety. The database schema already included the `Food`, `Allergen`, `FoodAllergen`, and `UserAllergies` tables; this version adds the API, model, and service code that starts using those tables.

You are looking at the correct version if:

- `README.md` shows version `v0.0.8`
- `app/backend/main.py` registers product and safety routers
- `app/backend/api/products.py` exists
- `app/backend/api/safety.py` exists
- `app/backend/models/product.py` exists
- `app/backend/services/product_service.py` exists
- `app/backend/tests/test_auth_dependency.py` exists
- `app/backend/.sample.env` includes `JWT_SECRET_KEY`
- `CHANGELOG.md` has a `v0.0.8` entry

## One-Sentence Objective

Version `v0.0.8` turns the product-and-safety database tables into a usable backend API surface with guarded product management, allergen management, user allergy profiles, safe-for-current-user filtering, and authentication regression coverage.

## Why This Version Matters

Before this version, the repository had a Supabase schema but no committed backend implementation for product listings or dietary safety. Contributors could inspect the tables, but they could not call product or allergen endpoints from the backend.

This version makes the first product-and-safety backend flow concrete:

- sellers can manage their own food listings through product routes,
- users can retrieve products with allergen metadata and safe-for-current-user status,
- users can manage their own allergy profile,
- admins can create allergen catalog entries,
- authentication now uses a backend-only JWT secret and rechecks the user's current database role before protected route logic runs,
- a focused test module locks down forged-token rejection and role-mismatch rejection.

## Plan A / Plan B

### Plan A: Backend Smoke Verification

1. Start the local Supabase stack.
2. Apply the database migrations.
3. Create a backend `.env` from `app/backend/.sample.env` and fill in local keys.
4. Install backend dependencies.
5. Start the FastAPI app with Uvicorn.
6. Open the generated OpenAPI docs and confirm product and safety routes are present.

### Plan B: Static Verification

1. Open `app/backend/main.py` and confirm `/products` and `/safety` are registered.
2. Open `app/backend/models/product.py` and review the request/response contracts.
3. Open `app/backend/services/product_service.py` and review how allergen relationships are attached to food responses.
4. Open `app/backend/tests/test_auth_dependency.py` and confirm the authentication dependency rejects forged and stale-role tokens.

Use Plan A when you have Docker, Supabase CLI, and backend dependencies ready. Use Plan B when you only need to verify the committed code shape.

## System View

```text
app/
  backend/
    .sample.env                         <- backend env template with JWT_SECRET_KEY
    main.py                             <- FastAPI app and router registration
    api/
      auth.py                           <- signup/login routes
      dependency.py                     <- token decoding and role revalidation
      products.py                       <- product listing and seller-owned product routes
      safety.py                         <- allergen catalog and current-user allergy routes
      users.py                          <- user/profile routes
    models/
      product.py                        <- product, allergen, and user-allergy schemas
      user.py                           <- user/auth schemas
    services/
      auth_service.py                   <- signup, login lookup, token creation, role context lookup
      product_service.py                <- product/allergen/user-allergy Supabase operations
      user_service.py                   <- user lookup helpers
    tests/
      test_auth_dependency.py           <- authentication dependency regression tests
  supabase/
    migrations/
      20260425000000_initial_schema.sql <- database schema consumed by the backend
```

## What Changed In Detail

### Product API Routes

`app/backend/api/products.py` adds product routes under `/products`:

- `GET /products/` lists food records and can include safe-for-current-user filtering.
- `POST /products/` lets sellers create food listings.
- `GET /products/{food_id}` fetches one listing with allergen metadata.
- `PATCH /products/{food_id}` lets the owning seller update a listing.
- `DELETE /products/{food_id}` lets the owning seller delete a listing.

Seller-only write routes use the authenticated user context from the shared dependency and then enforce seller ownership in the service layer for updates and deletes.

### Safety API Routes

`app/backend/api/safety.py` adds dietary-safety routes under `/safety`:

- `GET /safety/allergens` reads the allergen catalog.
- `POST /safety/allergens` lets admins add allergen entries.
- `GET /safety/me/allergies` returns the current user's allergies.
- `PUT /safety/me/allergies` replaces the current user's allergy set.
- `POST /safety/me/allergies/{allergen_id}` adds one allergy.
- `DELETE /safety/me/allergies/{allergen_id}` removes one allergy.

### Product and Safety Models

`app/backend/models/product.py` defines the Pydantic contracts for:

- allergen creation and responses,
- food creation, update, and responses,
- user allergy replacement and responses.

The food models validate UUIDs, non-negative prices, non-negative stock, required listing fields on create, and typed expiration dates.

### Product Service Layer

`app/backend/services/product_service.py` handles the Supabase operations for product and safety data:

- loads and validates allergen IDs,
- deduplicates ID lists before relationship writes,
- attaches allergen metadata to food responses,
- computes `matchedAllergenIDs` and `isSafeForCurrentUser`,
- checks seller ownership before product update/delete,
- logs backend database errors while returning stable client-facing messages.

The current implementation still performs some relationship replacement as multiple database calls. A future database migration should add transaction-backed operations for replacing food allergens and user allergies.

### Authentication Hardening

`app/backend/api/dependency.py` now verifies application JWTs with `JWT_SECRET_KEY` instead of the Supabase anon key. It also requires both `sub` and `role` claims, then re-fetches the user's current role from the database before route logic sees the authenticated context.

`app/backend/services/auth_service.py` now creates application JWTs with `JWT_SECRET_KEY`, fetches users for login through the server-side Supabase client, and creates the matching role-extension row during signup for buyers, sellers, charities, and admins.

### Regression Tests

`app/backend/tests/test_auth_dependency.py` adds focused tests for:

- rejecting a token signed with the Supabase anon key,
- rejecting a token whose role claim does not match the database role,
- accepting a token whose role matches the database role.

These tests target the highest-risk authentication boundary introduced by the product-and-safety routes.

## Acceptance Notes

This version is ready when:

- the backend code compiles with `python -m compileall app/backend`,
- `git diff --check` reports no whitespace errors,
- backend dependencies are installed from `app/backend/requirements.txt`,
- `python -m unittest discover tests` passes from `app/backend`,
- local Supabase is running and migrated,
- `/products` and `/safety` routes appear in the FastAPI OpenAPI schema,
- `README.md`, `CHANGELOG.md`, and this document all reference `v0.0.8`.

## Verification Commands

Run syntax checks from the repository root:

```powershell
python -m compileall app/backend
git diff --check
```

Run backend tests after installing dependencies:

```powershell
cd app/backend
python -m pip install -r requirements.txt
python -m unittest discover tests
```

Run the backend locally after configuring `.env`:

```powershell
cd app/backend
python -m uvicorn main:app --reload
```

## Pitfalls And Debugging

### `ModuleNotFoundError: No module named 'fastapi'`

Install backend dependencies from `app/backend/requirements.txt` before running the test suite or importing the app.

### Authentication Fails With Configuration Error

Confirm `JWT_SECRET_KEY` exists in the backend environment. This secret must be backend-only and must not be reused as the Supabase anon key.

### Product Writes Fail Under Row Level Security

Confirm the backend has `SUPABASE_SERVICE_ROLE_KEY` configured. The server-side product service uses a privileged Supabase client for controlled backend writes.

### Safe Filtering Looks Wrong

Check all three relationship surfaces:

- the user's rows in `UserAllergies`,
- the food's rows in `FoodAllergen`,
- the allergen catalog rows in `Allergen`.

If any relationship row is missing, the backend cannot identify the allergen match.

## Practice Drill

Add one test that proves a seller cannot update another seller's food listing.

Self-check:

- the test sets up one food row owned by seller A,
- the request or service call uses seller B,
- the backend returns a `403`,
- the food row remains unchanged.

## Mini Competency Map

- Level 1: Can start the backend and see `/products` and `/safety` in OpenAPI.
- Level 2: Can explain how `Food`, `Allergen`, `FoodAllergen`, and `UserAllergies` combine to produce safe-for-current-user output.
- Level 3: Can write service tests for product ownership and allergen filtering.
- Level 4: Can implement transaction-backed relationship replacement and prove rollback behavior with tests.

## Next 24-72 Hours

1. Install backend dependencies and run the authentication regression tests.
2. Add product/safety route tests for buyer, seller, and admin access.
3. Add transaction-backed database operations for replacing food allergens and user allergies.
4. Decide whether `/products` should hide expired or zero-stock listings by default for buyer discovery.
