# Version 0.2.0 Documentation

## Quick Diagnostic Read

Version `v0.2.0` changes Sureplus from a local-Supabase-first development setup to a remote Supabase-ready baseline for shared backend and frontend testing.

This version matters if you need:

- multiple developers testing against one consistent database schema,
- backend Supabase credentials kept out of frontend code,
- frontend API calls routed through one configurable backend base URL,
- hosted Supabase migration and dashboard setup documented clearly.

## One-Sentence Objective

Make Sureplus ready for coordinated development against the hosted Supabase project while preserving the optional local Supabase workflow for isolated database testing.

## Why This Version Matters

The previous setup worked for one developer running a local Supabase stack, but it allowed setup drift between team members. Different local database states make backend/frontend testing unreliable because a route can pass on one machine and fail on another if migrations, keys, or redirect URLs differ.

Version `v0.2.0` narrows that drift by documenting the hosted Supabase project as the shared development target and by making application configuration explicit:

- backend Supabase access is controlled by environment values,
- frontend API calls use `VITE_API_URL`,
- backend CORS is controlled by `BACKEND_CORS_ORIGINS`,
- Supabase auth redirect defaults align with Vite development URLs,
- public docs describe hosted migration and verification steps.

## What Changed

### Backend Configuration

The backend sample configuration now points at the hosted Sureplus Supabase URL and names the required runtime values:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_TIME_MINUTES`
- `BACKEND_CORS_ORIGINS`

The backend still requires elevated Supabase access for server-side database operations. That key must remain backend-only.

### Backend CORS

FastAPI CORS origins are now read from `BACKEND_CORS_ORIGINS`. This lets developers and deployments add frontend origins without changing backend source code every time the frontend host changes.

Default development origins remain:

- `http://localhost:3000`
- `http://localhost:5173`
- `http://127.0.0.1:5173`

### Frontend API Calls

The login and signup flows no longer hardcode `http://localhost:8000`. They now use the shared API client, which reads `VITE_API_URL`.

This makes the frontend easier to run against:

- a local FastAPI backend during development,
- a tunnel or staging backend during shared testing,
- a deployed backend later.

### Supabase Auth Redirect Defaults

The Supabase configuration now defaults local auth redirects to the Vite development frontend:

- Site URL: `http://localhost:5173`
- Additional redirect URLs:
  - `http://localhost:3000`
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`

The hosted Supabase dashboard still needs to be checked whenever frontend deployment URLs change.

### Documentation Refresh

The following public documents were refreshed for version `v0.2.0`:

- `README.md`
- `CHANGELOG.md`
- `CODE_OF_CONDUCT.md`
- `CONTRIBUTING.md`
- `LICENSE.txt`
- `SECURITY.md`
- `SUPABASE_SETUP.md`
- `THIRD-PARTY-NOTICES.md`

The main documentation shift is from "local Supabase onboarding" to "hosted Supabase shared development, with local Supabase as an optional isolated workflow."

## Validation Performed

Automated and local checks completed for this version:

```powershell
npm run build
```

Result: frontend TypeScript/Vite build passed.

```powershell
python -m unittest discover tests
```

Result: backend tests passed with 11 tests OK.

```powershell
git diff --check
```

Result: whitespace check passed.

Supabase CLI project linking completed for the hosted project, but hosted database migration commands could not complete from the current network path because the Postgres connection did not complete the TLS handshake. The fallback path is to apply reviewed migration SQL through the Supabase dashboard SQL editor, then reconcile migration history through the CLI from a network that can connect successfully.

## Hosted Supabase Completion Checklist

The remote Supabase setup is complete only when all of these are true:

- the hosted Table Editor shows the committed tables such as `User`, `Buyer`, `Seller`, `Food`, `Allergen`, `Purchase`, and `CharityPost`,
- the hosted Database Functions view shows the required RPC functions, including product-safety and charity amount functions,
- Supabase Auth URL configuration includes the active frontend development and deployed origins,
- backend runtime configuration uses current dashboard keys after any credential rotation,
- the frontend can sign up, log in, load allergens, and call at least one protected backend route.

## Operational Notes

The application currently uses FastAPI-managed login/signup flows and application JWTs. Supabase is the hosted database and platform layer behind the backend. The frontend should not receive backend-only Supabase credentials.

Storage buckets and Edge Functions are not part of the committed Supabase project surface in this version. If they are added later, they need explicit migration, deployment, and documentation steps.

## Known Follow-Up Work

Recommended next work after `v0.2.0`:

1. Confirm hosted migrations through `supabase migration list` once database connectivity is available.
2. Add a small live-environment smoke-test checklist for signup, login, product listing, allergen loading, and protected profile routes.
3. Add deployment-specific frontend and backend environment documentation after the team chooses a hosting target.
4. Add broader route coverage for live Supabase-backed workflows.

## Self-Check

You understand this version if you can answer:

- Why should the frontend use `VITE_API_URL` instead of hardcoded backend URLs?
- Why must elevated Supabase keys stay backend-only?
- What is the difference between applying SQL through the dashboard and applying migrations with `supabase db push`?
- Which dashboard checks prove the hosted Supabase project is ready for shared testing?
