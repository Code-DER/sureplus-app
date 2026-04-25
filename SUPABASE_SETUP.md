# SurePlus — Supabase Local Development Guide

> Complete setup guide for developers joining the project. No Supabase account required — everything runs locally via Docker.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Install Supabase CLI](#2-install-supabase-cli)
3. [Project Setup](#3-project-setup)
4. [Apply the Database Schema](#4-apply-the-database-schema)
5. [Start the Local Instance](#5-start-the-local-instance)
6. [Verify in Supabase Studio](#6-verify-in-supabase-studio)
7. [Row Level Security (RLS)](#7-row-level-security-rls)
8. [Common CLI Operations](#8-common-cli-operations)
9. [Connecting Your App](#9-connecting-your-app)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

Before starting, install the following:

### Docker Desktop _(required)_

Supabase runs all its services (database, auth, storage, etc.) in Docker containers locally.

- Download: https://www.docker.com/products/docker-desktop
- After installing, **launch Docker Desktop and keep it running** before using any `supabase` commands.
- Verify it's running:
  ```bash
  docker info
  ```

### Node.js v18+ _(if installing CLI via npm)_

- Download: https://nodejs.org
- Verify:
  ```bash
  node --version   # should be v18 or higher
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

> **Note:** No login or Supabase account is needed for local development.

---

## 3. Apply the Database Schema

The migration file `20260425000000_initial_schema.sql` is already inside `supabase/migrations/`. It contains:

- All 17 tables from the ERD
- Foreign key relationships
- Row Level Security (RLS) policies
- Performance indexes

You do **not** need to run this file manually — it is applied automatically when you run `supabase db reset` (see Step 5).

### If you need to add a new migration:

```bash
supabase migration new your_migration_name
# Edit the generated file in supabase/migrations/
```

---

## 4. Start the Local Instance

Make sure **Docker Desktop is running**, then:

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

> Save the `anon key` and `service_role key` — you'll need these to connect your frontend/backend.

### Apply all migrations:

```bash
supabase db reset
```

This wipes the local database and re-runs every file in `supabase/migrations/` in chronological order. **Run this every time you pull new migration files from the repo.**

---

## 6. Verify in Supabase Studio

Open your browser and go to:

```
http://localhost:54323
```

You should see the **local Supabase Studio** dashboard with:

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
supabase gen types typescript --local > src/types/supabase.ts
```

---

## 9. Connecting Your App

Use the local keys from `supabase status` or `supabase start` output.

### JavaScript / TypeScript

```bash
npm install @supabase/supabase-js
```

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "<your-local-anon-key>";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Flutter

```yaml
# pubspec.yaml
dependencies:
  supabase_flutter: ^2.0.0
```

```dart
await Supabase.initialize(
  url: 'http://localhost:54321',
  anonKey: '<your-local-anon-key>',
);
```

> **For mobile (iOS/Android):** Replace `localhost` with your machine's local IP address (e.g., `192.168.1.x`) so the device can reach your dev machine.

### Environment Variables

Never hardcode keys. Use a `.env` file:

```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<your-local-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-local-service-role-key>
```

Add `.env` to your `.gitignore`.

---

## 10. Troubleshooting

### `supabase start` fails

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

- Use the **service role key** (not anon key) in your backend/tests — it bypasses RLS
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
