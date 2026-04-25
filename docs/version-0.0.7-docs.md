# Version v0.0.7 Documentation

## Quick Diagnostic Read

This version brings the public-facing documentation in line with the newly committed local Supabase
project skeleton, the initial database migration, and the developer-onboarding guide.
No frontend or backend application source code was added in this version; the change is the
database layer plus its supporting documentation.

You are looking at the correct version if:

- `README.md` shows version `v0.0.7`
- `app/supabase/config.toml` exists with `project_id = "sureplus-app"`
- `app/supabase/.gitignore` exists and excludes `.branches`, `.temp`, and `dotenvx` env files
- `app/supabase/migrations/20260425000000_initial_schema.sql` exists with 17 tables and Row Level Security policies
- `SUPABASE_SETUP.md` exists at the repository root
- `CHANGELOG.md` has a `v0.0.7` entry describing the Supabase additions and matching documentation updates
- this file exists at `docs/version-0.0.7-docs.md`

## One-Sentence Objective

Version `v0.0.7` introduces the local Supabase project skeleton, the 17-table initial database
schema with Row Level Security policies, and a developer-onboarding guide, then reconciles
`README.md`, `CHANGELOG.md`, and `CONTRIBUTING.md` so they describe the new database layer
accurately.

## Why This Version Matters

Before this version, the repository had documentation describing a planned data model but no
committed database schema or local-development tooling. Contributors could read about entities
like `Buyer`, `Seller`, `Charity`, and `Food` but could not actually run a database against
those definitions on their machine.

This version makes the database layer real and reproducible:

- a Supabase CLI project under `app/supabase/` lets every contributor stand up the full local
  stack via Docker without needing a hosted Supabase account,
- the initial migration provisions every table the rest of the public docs reference,
- Row Level Security is enabled and policed on every table from day one, so authorization
  expectations are codified rather than deferred,
- a single onboarding doc (`SUPABASE_SETUP.md`) walks new contributors through CLI install,
  `supabase start`, `supabase db reset`, RLS posture, and connection examples for both
  TypeScript and Flutter clients.

The README, changelog, and contributing guide are then updated so they no longer describe
entities that are absent from the schema and no longer claim that no runnable layer exists.

## Plan A / Plan B

### Plan A: Database-First Verification

1. Start Docker Desktop.
2. From the repository root, change into `app/supabase/` and run `supabase start`.
3. Run `supabase db reset` to apply the initial migration.
4. Open `http://localhost:54323` and confirm the Studio shows 17 tables with no RLS warnings.
5. Confirm `README.md` version marker reads `v0.0.7` and references `SUPABASE_SETUP.md`.

### Plan B: Documentation-First Verification

1. Open `SUPABASE_SETUP.md` and read sections 1 through 7 once.
2. Open `README.md` and confirm the `Current Repository State`, `Prerequisites`, `Local Setup`,
   `Data Model Highlights`, and `Roadmap` sections all reflect the new database layer.
3. Open `CHANGELOG.md` and confirm the `v0.0.7` entry lists the Supabase additions and the
   documentation reconciliation.
4. Open `CONTRIBUTING.md` and confirm the development-workflow section now references
   `SUPABASE_SETUP.md` and explains how to add new migrations.

Use Plan A when you also want to confirm the schema actually applies cleanly.
Use Plan B when you only need to verify the public documentation is consistent.

## System View

```
sureplus-app/
  README.md                                   <- v0.0.7 marker, prereqs, local setup, data model, roadmap
  CHANGELOG.md                                <- v0.0.7 entry
  CONTRIBUTING.md                             <- references SUPABASE_SETUP.md and migration workflow
  SUPABASE_SETUP.md                           <- developer-onboarding guide for local Supabase
  CODE_OF_CONDUCT.md                          <- unchanged
  SECURITY.md                                 <- unchanged
  LICENSE.txt                                 <- unchanged
  app/
    supabase/
      config.toml                             <- Supabase CLI project config (project_id, ports, auth, storage)
      .gitignore                              <- Supabase-local exclusions (.branches, .temp, .env.*)
      migrations/
        20260425000000_initial_schema.sql     <- 17 tables, RLS policies, indexes
  docs/
    version-0.0.7-docs.md                     <- this file
```

## What Changed In Detail

### Supabase Project Skeleton

`app/supabase/config.toml` registers the project under the identifier `sureplus-app` and pins
the local stack to a known port layout:

- API on `54321`
- database on `54322`
- shadow database on `54320`
- Studio on `54323`
- Inbucket (email testing) on `54324`
- Analytics on `54327`

Default configuration enables the API, realtime, Studio, Inbucket, storage, edge runtime, and
analytics services with conservative defaults. Authentication is configured for local
development with email signup enabled, anonymous sign-in disabled, password length minimum of
six characters, and refresh-token rotation enabled. SMS, MFA, captcha, and external OAuth
providers are disabled by default and surface as commented-out templates for future
configuration.

`app/supabase/.gitignore` excludes the Supabase-local working folders (`.branches`, `.temp`)
and the dotenvx-style environment artifacts (`.env.keys`, `.env.local`, `.env.*.local`) so
local Supabase state never enters the tracked history.

### Initial Database Migration

`app/supabase/migrations/20260425000000_initial_schema.sql` provisions 17 tables and enables
Row Level Security on every one of them:

| Table | Purpose | Representative RLS posture |
| --- | --- | --- |
| `User` | Identity, contact, address, role | Self-read, self-update |
| `Buyer` | Buyer-role extension with points | Self-read, self-update |
| `Seller` | Seller-role extension, verification flag, company name | Self-manage; verified sellers publicly visible |
| `Charity` | Charity-role extension, organization name | Self-manage |
| `Admin` | Admin-role extension, employee identifier | Self-read |
| `Notifications` | Per-user notifications | Self-read, self-delete |
| `CharityApplication` | Charity-role applications with status | Self-read, self-insert |
| `CharityPost` | Charity donation posts | Public read; charity self-manage |
| `Allergen` | Allergen catalog | Public read |
| `Food` | Seller food listings, price, stock, expiration, edible flag | Public read; seller self-manage |
| `FoodAllergen` | Many-to-many between food and allergen | Public read; seller self-manage via owning food |
| `UserAllergies` | Many-to-many between user and allergen | Self-manage |
| `Purchase` | Buyer purchases with payment method, total, status | Buyer self-read, self-insert |
| `PurchaseItems` | Line items linked to a purchase | Buyer self-manage via owning purchase |
| `SocialImpact` | Carbon offset, rescued kilos, people fed per purchase | Buyer self-read via owning purchase |
| `Rating` | Bidirectional ratings tied to a purchase | Public read; buyer self-insert and self-update |
| `AdminActivity` | Admin action logs | Admin self-read, self-insert |

The migration also installs the `pgcrypto` extension for `gen_random_uuid()`, enforces an
allowed-role check on `User.role` for `buyer`, `seller`, `charity`, and `admin`, defines status
checks on `CharityApplication.status` and `Purchase.status`, applies a one-to-five rating
constraint on `Rating.rating`, and creates 16 supporting indexes on foreign-key columns to keep
join paths fast.

Innovator, composter, recycling-request, conversation, and direct-message entities described
in the broader product narrative are deliberately not in this initial migration. They remain on
the roadmap and are called out as such in the README so contributors do not assume tables exist
that do not.

### Developer-Onboarding Guide

`SUPABASE_SETUP.md` is a self-contained walkthrough that covers:

- prerequisites (Docker Desktop, Node.js 18+ for npm install, Homebrew for the macOS path),
- Supabase CLI install via `brew install supabase/tap/supabase` or `npm install -g supabase`,
- expected output from `supabase start`, including local URLs and the anon and service-role
  keys,
- applying migrations via `supabase db reset`,
- verifying the schema in Supabase Studio at `http://localhost:54323`,
- the per-table RLS policy summary,
- common CLI operations for migrations, status, and logs,
- connection snippets for JavaScript or TypeScript via `@supabase/supabase-js` and for Flutter
  via `supabase_flutter`,
- environment-variable handling and `.env` hygiene,
- troubleshooting for failed `supabase start`, broken migrations, missing tables, RLS-blocked
  queries, and mobile-emulator connectivity,
- a database-schema overview diagram.

### README Reconciliation

`README.md` was updated in five places:

- the version marker advanced from `v0.0.6` to `v0.0.7`,
- the `Current Repository State` section now mentions the committed Supabase project,
  the initial migration, and the RLS posture, and points readers at `SUPABASE_SETUP.md`
  and at this version document,
- the `Prerequisites` list adds Docker Desktop and the Supabase CLI,
- the `Local Setup` numbered steps add a Supabase bring-up step (`supabase start` followed by
  `supabase db reset`) and renumber the trailing item,
- the `Data Model Highlights` section now matches the actual schema (it describes the four
  user-role extensions that exist, drops the entity names that are not in the migration, adds
  `CharityApplication`, and explicitly notes the omitted entities are roadmap work),
- the `Roadmap` checklist marks the initial migration as complete and adds a follow-up
  checklist item for further migrations, validation rules, tests, deployment notes, and
  operations guidance.

### Changelog Reconciliation

`CHANGELOG.md` adds a `v0.0.7` entry listing every Supabase addition, the 17-table coverage
of the initial migration, the new onboarding guide, and the matching README and contributing
updates. The `For Deletion` subsection records that there are no deletion candidates produced
by this version.

### Contributing-Guide Reconciliation

`CONTRIBUTING.md` updates the development-workflow section so that it no longer claims no
runnable layer exists. It now states that the database layer is provisioned through Supabase,
points readers at `SUPABASE_SETUP.md`, and instructs contributors to add new migration files
via `supabase migration new <name>` rather than editing the initial migration in place.
The expectation that `supabase db reset` succeeds locally before opening a pull request is
called out explicitly.

## Acceptance Notes

This version is ready when:

- `README.md` version marker reads `v0.0.7`
- `README.md` `Current Repository State` references `SUPABASE_SETUP.md` and this version doc
- `CHANGELOG.md` has a `v0.0.7` entry
- `CONTRIBUTING.md` references `SUPABASE_SETUP.md` and the migration workflow
- `app/supabase/config.toml`, `app/supabase/.gitignore`, and the initial migration file all
  exist
- `SUPABASE_SETUP.md` exists at the repository root
- `SECURITY.md`, `CODE_OF_CONDUCT.md`, and `LICENSE.txt` remain untouched
- a clean `supabase start` followed by `supabase db reset` succeeds against the migration
- `git diff --check` reports no whitespace issues

## Verification Commands

Run these from the repository root.

```powershell
git diff -- README.md CHANGELOG.md CONTRIBUTING.md docs/version-0.0.7-docs.md
```

Use this to inspect the full documentation patch for this version.

```powershell
rg -n "Version: v0.0.7|version-0.0.7-docs|SUPABASE_SETUP\.md|app/supabase" README.md CHANGELOG.md CONTRIBUTING.md
```

Use this to confirm the version marker, version-document reference, onboarding-guide
reference, and project-skeleton path all appear in the public docs.

```powershell
cd app/supabase
supabase start
supabase db reset
supabase status
```

Use these to bring up the local stack, apply the initial migration, and confirm the local
URLs and keys are reported.

```powershell
git diff --check
```

Use this to catch trailing whitespace or patch formatting issues.

## Pitfalls And Debugging

### Studio Shows Fewer Than 17 Tables

Confirm `supabase db reset` ran without errors. If a prior reset failed mid-migration, the
shadow database may be inconsistent; rerun `supabase db reset` after fixing the offending SQL.

### RLS Blocks Every Query Locally

This is expected. Use the service-role key (printed by `supabase start` and `supabase status`)
in backend tests, or temporarily disable RLS on the table via the SQL editor in Studio for
local exploration only. Never commit code that depends on RLS being disabled.

### `supabase start` Fails With Port In Use

Edit `app/supabase/config.toml` and change the conflicting port. Common offenders are
`54321` (API) and `54323` (Studio).

### Mobile Emulator Cannot Reach `localhost`

Replace `localhost` with the development machine's LAN IP in client configuration. The
onboarding guide gives platform-specific commands for retrieving the IP.

### README Still Lists Innovator Or Composter Tables

Re-pull the branch. The `Data Model Highlights` section in this version intentionally drops
those names because they are not in the initial migration.

## Practice Drill

Before opening a follow-up pull request that changes the schema:

1. Run `supabase migration new add_<your_change>` from `app/supabase/`.
2. Edit only the new migration file. Do not modify the existing initial-schema migration.
3. Run `supabase db reset` and confirm the new migration applies cleanly.
4. Update `CHANGELOG.md` with a new version entry that lists the new migration.
5. Update `README.md` `Data Model Highlights` if the change introduces or removes tables.

Self-check:

- the new migration is a separate file under `app/supabase/migrations/`,
- the initial migration is unchanged,
- `supabase db reset` succeeds locally,
- `CHANGELOG.md` and `README.md` accurately describe the new schema state.

## Mini Competency Map

- Level 1: Can install the Supabase CLI, start the local stack, and apply the initial migration.
- Level 2: Can navigate Supabase Studio and verify tables, foreign keys, and RLS posture.
- Level 3: Can author a new migration file, write RLS policies appropriate to the table, and
  reconcile the public docs to match.
- Level 4: Can review another contributor's migration for RLS gaps, foreign-key correctness,
  and documentation drift.

## Next 24-72 Hours

1. Bring up the local Supabase stack and confirm `supabase db reset` succeeds against the
   initial migration.
2. Skim every RLS policy in the initial migration and write one sentence per table describing
   what is allowed and what is denied.
3. Plan the next migration so that any new tables follow the same RLS-enabled-by-default
   posture as the initial schema.
4. Begin scaffolding the frontend or backend stack so that future versions can document
   runnable application code in addition to the database layer.
