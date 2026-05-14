# Third-Party Notices

## Scope

This repository uses third-party dependencies through package manifests for the frontend and backend application stacks.

Current dependency sources include:

- Python backend packages listed in `app/backend/requirements.txt`
- JavaScript frontend packages listed in `app/frontend/package.json` and locked in `app/frontend/package-lock.json`
- Supabase platform and CLI usage documented in `SUPABASE_SETUP.md`

## Bundled Code

No third-party source code is intentionally vendored into this repository as part of the current scaffold.

## License Review Status

The project is in a remote Supabase-ready development baseline. Before a public release or production deployment, maintainers should:

- review backend and frontend dependency licenses,
- confirm each dependency is compatible with the repository license and intended use,
- document any required attribution notices,
- update this file with package-specific notices when required.
- confirm hosted-platform terms, API-key handling, and data-processing obligations are reviewed for the intended deployment context.

## Maintainer Note

When adding a new dependency, prefer well-maintained packages with clear licensing, active security maintenance, and a concrete reason for inclusion.
