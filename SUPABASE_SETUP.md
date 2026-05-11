# SurePlus — Supabase Remote Development Guide

> Setup guide for the shared hosted Supabase development project, with an optional local Docker workflow for isolated database testing.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Install Supabase CLI](#2-install-supabase-cli)
3. [Remote Project Setup](#3-remote-project-setup)
4. [Apply the Hosted Database Schema](#4-apply-the-hosted-database-schema)
5. [Optional Local Instance](#5-optional-local-instance)
6. [Verify in Supabase Studio](#6-verify-in-supabase-studio)
7. [Row Level Security (RLS)](#7-row-level-security-rls)
8. [Common CLI Operations](#8-common-cli-operations)
9. [Connecting Your App](#9-connecting-your-app)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

Before starting, install the following:

### Supabase Project Access _(required for shared development)_

- Access to the Sureplus Supabase project in the Supabase dashboard.
- Permission to read project API keys and database connection settings.
- Permission to run database migrations or apply reviewed SQL in the hosted project.

### Docker Desktop _(optional local database testing)_

Supabase can run its services (database, auth, storage, etc.) in Docker containers locally when you need an isolated database.

- Download: https://www.docker.com/products/docker-desktop
- After installing, **launch Docker Desktop and keep it running** before using any `supabase` commands.
- Verify it's running:
  ```bash
  docker info
  ```

### Node.js v20+ _(if installing CLI via npm)_

- Download: https://nodejs.org
- Verify:
  ```bash
  node --version   # should be v20 or higher for current Supabase CLI npm usage
  ```

### Homebrew _(macOS alternative for CLI install)_

- Install: https://brew.sh

---

## 2. Install Supabase CLI

Choose one method based on your OS:

**macOS (Homebrew) — recommended for Mac**

```bash
brew install supabase/tap/supabase
```

**Windows / Linux (npm)**

```bash
npm install -g supabase
```

**Verify the install:**

```bash
supabase --version
```

---

## 3. Remote Project Setup

The shared development project uses the hosted Supabase project configured in the dashboard. Developers should connect the Supabase CLI to the hosted project before applying migrations:

```bash
cd app/supabase
supabase login
supabase link --project-ref <project-ref>
```

Use the database password from the Supabase dashboard when prompted. Do not commit or publish database passwords, backend-only elevated keys, or application JWT signing secrets.

Required backend configuration values:

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<dashboard anon or publishable key>
SUPABASE_SERVICE_ROLE_KEY=<backend-only secret or service-role key>
JWT_SECRET_KEY=<strong backend-only application secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_TIME_MINUTES=30
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173
```

Frontend configuration should point to the FastAPI backend, not directly to the backend-only Supabase key:

```env
VITE_API_URL=http://localhost:8000
```

---

## 4. Apply the Hosted Database Schema

The migration directory under `app/supabase/migrations/` contains the database schema, Row Level Security policies, indexes, and RPC functions required by the backend.

From `app/supabase/`, apply migrations to the hosted project:

```bash
supabase migration list
supabase db push --dry-run
supabase db push
```

Use `--dry-run` first to confirm which migrations will be applied. The hosted project is ready only after the tables and RPC functions exist in Supabase Studio.

If your network cannot complete the hosted Postgres connection, apply the reviewed migration SQL files through the Supabase dashboard SQL editor in chronological order. If SQL editor application is used, reconcile migration history later with the Supabase CLI before relying on `supabase migration list` as the source of truth.

### If you need to add a new migration:

```bash
supabase migration new your_migration_name
# Edit the generated file in supabase/migrations/
```

---

## 5. Optional Local Instance

Use the local instance when you need isolated testing without touching the hosted development database. Make sure **Docker Desktop is running**, then:

```bash
supabase start
```

First-time setup downloads the Supabase Docker images — this may take a few minutes. On success, you will see:

```
API URL:         http://localhost:54321
GraphQL URL:     http://localhost:54321/graphql/v1
DB URL:          postgresql://postgres:postgres@localhost:54322/postgres
Studio URL:      http://localhost:54323
Inbucket URL:    http://localhost:54324    ← local email testing
JWT secret:      super-secret-jwt-token-with-at-least-32-characters-long
anon key:        <your-local-anon-key>
service_role key: <your-local-service-role-key>
```

> Local keys are for the local stack only. Do not mix local keys with the hosted project URL.

### Apply all migrations:

```bash
supabase db reset
```

This wipes the local database and re-runs every file in `supabase/migrations/` in chronological order. **Run this only against the local stack.**

---

## 6. Verify in Supabase Studio

For the hosted project, open the Supabase dashboard and verify the Table Editor and Database Functions pages. For the optional local project, open:

```
http://localhost:54323
```

You should see:

- **17 tables** in the Table Editor: `User`, `Buyer`, `Seller`, `Charity`, `Admin`, `Notifications`, `CharityApplication`, `CharityPost`, `Allergen`, `Food`, `FoodAllergen`, `UserAllergies`, `Purchase`, `PurchaseItems`, `SocialImpact`, `Rating`, `AdminActivity`
- **0 RLS warnings** in the Security Advisor (all tables have RLS enabled)

---

## 7. Row Level Security (RLS)

RLS is enabled on **all 17 tables**. This means by default, no data is accessible unless a policy explicitly allows it. Here is a summary of the policies applied:

| Table                | Policy Summary                                                         |
| -------------------- | ---------------------------------------------------------------------- |
| `User`               | Users can only read/update their own record                            |
| `Buyer`              | Buyers can only read/update their own record                           |
| `Seller`             | Sellers manage their own record; verified sellers are publicly visible |
| `Charity`            | Charities manage their own record                                      |
| `Admin`              | Admins can only view their own record                                  |
| `Notifications`      | Users can only read/delete their own notifications                     |
| `CharityApplication` | Users can read/insert their own application                            |
| `CharityPost`        | Public read; only owning charity can insert/update/delete              |
| `Allergen`           | Public read for all                                                    |
| `Food`               | Public read; sellers manage their own listings                         |
| `FoodAllergen`       | Public read; sellers manage allergens on their own food                |
| `UserAllergies`      | Users fully manage their own allergy records                           |
| `Purchase`           | Buyers can read/insert their own purchases                             |
| `PurchaseItems`      | Buyers can read/insert items linked to their own purchases             |
| `SocialImpact`       | Buyers can view impact linked to their own purchases                   |
| `Rating`             | Public read; buyers insert/update their own ratings                    |
| `AdminActivity`      | Admins can read/insert their own activity logs                         |

### Temporarily disabling RLS (for local testing only)

```sql
-- Run in Supabase Studio → SQL Editor
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
-- Remember to re-enable before committing:
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
```

---

## 8. Common CLI Operations

### Start / Stop

```bash
supabase start          # start all local containers
supabase stop           # stop containers (data is preserved)
supabase stop --no-backup  # stop and delete all local data
```

### Database

```bash
supabase db reset               # wipe local DB and re-apply all migrations
supabase db pull                # pull schema from a linked remote project
supabase db push                # push local migrations to a linked remote project
supabase db diff                # show schema differences
supabase db diff -f new_change  # save diff as a new migration file
```

### Migrations

```bash
supabase migration new <name>   # create a new blank migration file
supabase migration list         # list all migrations and their status
supabase migration up           # apply pending migrations without resetting
```

### Status & Logs

```bash
supabase status                 # show local URLs, keys, and container status
supabase logs db                # view database logs
supabase logs auth              # view auth service logs
supabase logs realtime          # view realtime logs
```

### Type Generation _(optional — for TypeScript projects)_

```bash
supabase gen types typescript --linked > src/types/supabase.ts
```

---

## 9. Connecting Your App

The Sureplus frontend calls the FastAPI backend through `VITE_API_URL`. The backend is responsible for Supabase access and must keep elevated Supabase credentials server-side only.

### Backend

Configure these backend values from the Supabase dashboard and deployment environment:

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<dashboard anon or publishable key>
SUPABASE_SERVICE_ROLE_KEY=<backend-only secret or service-role key>
JWT_SECRET_KEY=<strong backend-only application secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_TIME_MINUTES=30
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173
```

### Frontend

```env
VITE_API_URL=http://localhost:8000
```

Do not add backend-only Supabase keys to frontend configuration.

### Auth Redirect URLs

In the Supabase dashboard, set the development auth URL configuration to:

```text
Site URL: http://localhost:5173
Redirect URLs:
http://localhost:5173/**
http://127.0.0.1:5173/**
```

Add deployed frontend URLs before production testing.

---

## 10. Troubleshooting

### `supabase db push` cannot connect to the hosted database

- Confirm the project is linked with the correct project reference.
- Confirm the database password is current.
- Try from another network if direct Postgres or pooler TLS handshakes time out.
- If blocked, apply reviewed migration SQL through the dashboard SQL editor, then reconcile migration history later.

### Frontend CORS errors

- Confirm `VITE_API_URL` points to the running FastAPI backend.
- Confirm `BACKEND_CORS_ORIGINS` includes the current frontend origin.
- Restart the backend after changing CORS configuration.

### `supabase start` fails for local testing

- Make sure **Docker Desktop is running**
- Try restarting Docker, then run `supabase start` again
- If ports are in use, edit `supabase/config.toml` to change port numbers

### `supabase db reset` shows migration errors

- Read the error message carefully — it usually points to the failing SQL line
- Open the SQL file in `supabase/migrations/` and fix the syntax
- Run `supabase db reset` again

### Tables not showing in Studio

- Confirm you ran `supabase db reset` after `supabase start`
- Refresh the Studio browser tab at `http://localhost:54323`

### RLS blocking all queries during testing

- Use the backend-only elevated key for controlled backend/test operations that intentionally bypass RLS
- Or temporarily disable RLS on the table via the SQL Editor in Studio (for local dev only)

### Can't connect from mobile emulator

- Use your machine's local IP instead of `localhost`:
  ```bash
  ipconfig getifaddr en0   # macOS
  ipconfig                 # Windows (look for IPv4 Address)
  ```

---

## Database Schema Overview

```
User
├── Buyer           (1:1)
├── Seller          (1:1)
├── Charity         (1:1)
├── Admin           (1:1)
├── Notifications   (1:many)
├── CharityPost     (1:many, via Charity role)
├── CharityApplication (1:many)
├── Purchase        (1:many, via Buyer role)
│   ├── PurchaseItems  (1:many)
│   ├── SocialImpact   (1:1)
│   └── Rating         (1:1)
└── UserAllergies   (many:many → Allergen)

Food (owned by Seller)
└── FoodAllergen    (many:many → Allergen)

AdminActivity (owned by Admin)
```

---

> For questions or issues, open a ticket in the project repository.
