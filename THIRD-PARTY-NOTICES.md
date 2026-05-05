# Third-Party Notices

## Scope

This repository uses third-party dependencies through package manifests for the frontend and backend application stacks.

Current dependency sources include:

- Python backend packages listed in `app/backend/requirements.txt`
- JavaScript frontend packages listed in `app/frontend/package.json` and locked in `app/frontend/package-lock.json`
- Supabase local-development tooling documented in `SUPABASE_SETUP.md`

## Bundled Code

No third-party source code is intentionally vendored into this repository as part of the current scaffold.

## License Review Status

The project is still in an early scaffold stage. Before a public release or production deployment, maintainers should:

- review backend and frontend dependency licenses,
- confirm each dependency is compatible with the repository license and intended use,
- document any required attribution notices,
- update this file with package-specific notices when required.

## Maintainer Note

When adding a new dependency, prefer well-maintained packages with clear licensing, active security maintenance, and a concrete reason for inclusion.
