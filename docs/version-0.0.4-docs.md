# Version v0.0.4 Documentation

## Quick Diagnostic Read

This version documents the first backend and frontend environment sample placeholders.
The placeholders exist so future stack-specific environment variables have an obvious home without committing real secret values.

You are looking at the correct version if:

- `README.md` shows version `v0.0.4`
- `README.md` mentions `sureplus-app/backend/.sample.env`
- `README.md` mentions `sureplus-app/frontend/.sample.env`
- `CHANGELOG.md` has a `v0.0.4` entry for the environment sample placeholders
- this file exists at `docs/version-0.0.4-docs.md`

## One-Sentence Objective

Version `v0.0.4` records backend and frontend environment sample placeholders while keeping the repository's early-scaffold status clear.

## Why This Version Matters

Environment files are a common source of setup confusion and secret leakage.
Adding sample placeholders gives the backend and frontend a predictable configuration surface while preserving the boundary that real `.env` files must stay local.

This version does not define runtime variables yet.
It only documents the current placeholder state so future implementation work can fill in required names deliberately.

## Plan A / Plan B

### Plan A: Commit Candidate Review

1. Confirm the two `.sample.env` files are present.
2. Confirm they contain no secrets.
3. Confirm README setup guidance points to the placeholders.
4. Confirm the changelog entry describes only this documentation and placeholder update.
5. Confirm no application runtime behavior is claimed yet.

### Plan B: Setup-Path Review

1. Start at `README.md`.
2. Follow the local setup steps.
3. Run the PowerShell sample-env discovery command.
4. Confirm the command returns backend and frontend placeholder paths.
5. Wait to add actual variable names until the frontend or backend stack defines them.

## System View

The current scaffold has this configuration shape:

```text
repository root
  -> sureplus-app/
      -> backend/
          -> .sample.env
      -> frontend/
          -> .sample.env
  -> README.md
  -> CHANGELOG.md
  -> docs/version-0.0.4-docs.md
```

The sample files are placeholders only.
No backend framework, frontend framework, dependency manifest, database connection, API base URL, or deployment secret is defined by this version.

## What Changed In Detail

### Backend Environment Placeholder

`sureplus-app/backend/.sample.env` now marks where backend environment configuration examples can be added later.

Use this file for non-secret variable names and safe example values only.
Do not place real credentials, tokens, connection strings, or private keys in it.

### Frontend Environment Placeholder

`sureplus-app/frontend/.sample.env` now marks where frontend environment configuration examples can be added later.

Frontend environment values are still public-facing once bundled unless the selected framework explicitly keeps them server-side.
Treat future frontend variables as configuration hints, not secret storage.

### README Update

The README now:

- shows version `v0.0.4`
- mentions the backend and frontend placeholder paths in the current repository state
- adds a PowerShell discovery command for the sample files
- keeps the warning that runnable application manifests are not yet committed

### Changelog Update

The changelog now records the placeholder files, README version bump, setup guidance update, and this detailed version document.

## Acceptance Notes

This version is ready when:

- both `.sample.env` files are included in the commit candidate
- both `.sample.env` files contain no real secrets
- the README still describes the project as design kickoff / early scaffold
- `git diff --check` reports no whitespace issues
- no real `.env` files are staged

## Verification Commands

Run these from the repository root.

```powershell
git status --short --untracked-files=all
```

Use this to confirm the two sample env files and documentation updates are the intended commit candidate.

```powershell
Get-ChildItem -Force sureplus-app -Recurse -Filter .sample.env | Select-Object FullName,Length
```

Use this to confirm the backend and frontend placeholders exist and contain no committed secret values.

```powershell
git diff -- README.md CHANGELOG.md docs/version-0.0.4-docs.md
```

Use this to review documentation changes before committing.

```powershell
git diff --check
```

Use this to catch trailing whitespace or patch formatting issues.

## Pitfalls And Debugging

### Real Secrets Are Added

Stop and remove them before committing.
The repository ignores real `.env` files, but reviewers should still inspect staged changes before every commit.

### Variable Names Are Invented Too Early

Wait for the actual backend and frontend stack to define required configuration.
Premature variable names become stale setup debt quickly.

### The Placeholder Names Are Confused With Runtime Files

The files in this version are samples.
Runtime environment files should remain local and uncommitted unless the team explicitly approves a safe non-secret example format.

## Practice Drill

Before committing environment-sample updates:

1. Run `git status --short --untracked-files=all`.
2. Open every staged or untracked env-related file.
3. Verify there are no real credentials or tokens.
4. Confirm README setup guidance matches the file names exactly.

Self-check:

- sample files are safe to publish
- real `.env` files are absent from the commit
- documentation does not claim a runnable backend or frontend yet

## Mini Competency Map

- Level 1: Can distinguish sample env files from real local env files.
- Level 2: Can document setup placeholders without exposing secrets.
- Level 3: Can update README and changelog entries to match the actual commit candidate.
- Level 4: Can design future environment-variable documentation around framework-specific rules.

## Next 24-72 Hours

1. Commit the environment sample placeholder and documentation update after review.
2. Decide the backend and frontend framework stack before adding concrete variable names.
3. Replace empty placeholders with safe example keys only when the runtime configuration contract is known.
