# Changelog

Status: design kickoff / early scaffold.

## v0.0.9

### Added or Changed
- Added a backend code-review report for the issue #10 product-and-safety feature slice.
- Documented remaining review findings around transactional relationship writes, service-role configuration, route/service test coverage, and product discovery defaults.
- Updated the README version marker from `v0.0.8` to `v0.0.9`.
- Added detailed version documentation at `docs/version-0.0.9-docs.md`.

### For Deletion
- None from this task context.

## v0.0.8

### Added or Changed
- Added the initial FastAPI product-and-safety backend feature slice under `app/backend/`.
- Added product routes for listing food, fetching food details, and seller-owned create, update, and delete operations.
- Added safety routes for allergen catalog reads, admin-owned allergen creation, and current-user allergy profile management.
- Added product, allergen, and user-allergy Pydantic models.
- Added a product service layer for allergen validation, safe-for-current-user matching, seller ownership checks, and stable client-facing database error messages.
- Hardened backend JWT handling by using a backend-only `JWT_SECRET_KEY` and revalidating token role claims against the current database user role.
- Added backend authentication regression tests for forged-token rejection and role-mismatch rejection.
- Updated the backend environment sample with Supabase and JWT settings.
- Updated the README version marker from `v0.0.7` to `v0.0.8`.
- Updated README setup, current-state, backend API, and roadmap sections for the committed backend API scaffold.
- Added detailed version documentation at `docs/version-0.0.8-docs.md`.

### For Deletion
- None from this task context.

## v0.0.7

### Added or Changed
- Added the local Supabase project skeleton under `app/supabase/` with `config.toml` and `.gitignore`.
- Added the initial database migration `app/supabase/migrations/20260425000000_initial_schema.sql` covering 17 tables (`User`, `Buyer`, `Seller`, `Charity`, `Admin`, `Notifications`, `CharityApplication`, `CharityPost`, `Allergen`, `Food`, `FoodAllergen`, `UserAllergies`, `Purchase`, `PurchaseItems`, `SocialImpact`, `Rating`, `AdminActivity`) with foreign keys, Row Level Security policies, and performance indexes.
- Added `SUPABASE_SETUP.md` at the repository root as the developer-onboarding guide for local Supabase via Docker (CLI install, `supabase start`, `supabase db reset`, RLS summary, and connection examples).
- Updated the README version marker from `v0.0.6` to `v0.0.7`.
- Updated the README current-state, prerequisites, local-setup, data-model, and roadmap sections to reflect the committed database layer and the new Supabase onboarding flow.
- Updated `CONTRIBUTING.md` to point backend-data work at the local Supabase setup defined in `SUPABASE_SETUP.md`.
- Added detailed version documentation at `docs/version-0.0.7-docs.md`.

### For Deletion
- None from this task context.

## v0.0.6

### Added or Changed
- Added `.california-agentic/` to `.gitignore` to exclude the local agentic shell directory from version control.
- Updated the README version marker from `v0.0.5` to `v0.0.6`.
- Updated the README current-state section documentation pointer to `docs/version-0.0.6-docs.md`.
- Added detailed version documentation at `docs/version-0.0.6-docs.md`.

### For Deletion
- None from this task context.

## v0.0.5

### Added or Changed
- Updated the README proprietary license badge color from gray to red.
- Updated the README version marker from `v0.0.4` to `v0.0.5`.
- Updated the README current-version documentation pointer to `docs/version-0.0.5-docs.md`.
- Added detailed version documentation at `docs/version-0.0.5-docs.md`.

### For Deletion
- None from this task context.

## v0.0.4

### Added or Changed
- Added backend and frontend environment sample placeholder files at `sureplus-app/backend/.sample.env` and `sureplus-app/frontend/.sample.env`.
- Updated the README version marker from `v0.0.3` to `v0.0.4`.
- Updated the README current-state and local-setup guidance to acknowledge the environment sample placeholders while preserving the early-scaffold status.
- Added detailed version documentation at `docs/version-0.0.4-docs.md`.

### For Deletion
- `update.zip` exists locally as an ignored packaged archive. It was not changed by this task, but should stay out of commits and can be removed manually if no longer needed.

## v0.0.3

### Added or Changed
- Centered the README badge row by replacing the top Markdown badge references with a GitHub-renderable HTML alignment block.
- Preserved the proprietary static license badge while moving it into the centered badge row.
- Removed unused README badge reference definitions after converting the badge links to inline HTML.
- Added detailed version documentation at `docs/version-0.0.3-docs.md`.

### For Deletion
- None from this task context.

## v0.0.2

### Added or Changed
- Replaced the incorrect open-source license text with the proprietary all-rights-reserved Sureplus Website Development Team notice.
- Updated the README license section to describe the repository as proprietary and confidential.
- Replaced the dynamic license-detection badge with a static proprietary badge so the README no longer displays misleading license metadata.
- Corrected the previous version documentation and changelog wording so they no longer describe the repository as open-source licensed.
- Added detailed version documentation at `docs/version-0.0.2-docs.md`.

### For Deletion
- None from this task context.

## v0.0.1

### Added or Changed
- Initialized root project documentation for the Sureplus Website repository.
- Added a Sureplus-specific README with project scope, features, data-model highlights, setup notes, roadmap, maintainers, and repository links.
- Added detailed version documentation at `docs/version-0.0.1-docs.md`.
- Added governance documentation for contribution process, code of conduct, security reporting, and proprietary licensing.
- Added ignore-file coverage for local workflow files, generated dumps, package exports, web build outputs, dependency folders, logs, caches, environment files, and local database artifacts.
- Added the README screenshot asset at `repo/images/project_screen.png`.

### For Deletion
- None from this task context.
