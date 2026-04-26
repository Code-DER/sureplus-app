# Version v0.0.6 Documentation

## Quick Diagnostic Read

This version updates `.gitignore` to exclude a local agentic shell directory from version control.
No application source code, tests, or governance documents changed.

You are looking at the correct version if:

- `README.md` shows version `v0.0.6`
- `.gitignore` contains `.california-agentic/` as an ignored path
- `CHANGELOG.md` has a `v0.0.6` entry for the ignore-file update
- this file exists at `docs/version-0.0.6-docs.md`

## One-Sentence Objective

Version `v0.0.6` adds a `.gitignore` entry so the local agentic shell directory is never accidentally committed to the repository.

## Why This Version Matters

The local agentic shell directory contains machine-local scripts, packagers, and helper utilities
that are not part of the application source and should not appear in the repository history.
Without this ignore entry the directory could be unintentionally staged and committed, polluting
the tracked history with local-only artifacts.

This is a repository hygiene update only.
It does not change license terms, application behavior, schema, dependencies, or governance documents.

## Plan A / Plan B

### Plan A: Ignore-File Review

1. Open `.gitignore`.
2. Confirm `.california-agentic/` appears under the appropriate local-exclusion section.
3. Confirm no application source paths, test files, or governance files were removed or altered.
4. Confirm `README.md` version marker reads `v0.0.6`.

### Plan B: Git Status Check

1. Run `git status` from the repository root.
2. Confirm only `.gitignore`, `README.md`, `CHANGELOG.md`, and `docs/version-0.0.6-docs.md` appear in the change set.
3. Confirm the agentic shell directory does not appear as an untracked or staged file.

## System View

The ignore hierarchy after this change:

```text
.gitignore
  agent/               <- workflow brain, already ignored
  dump/                <- local dump artifacts, already ignored
  learn/               <- local learning assets, already ignored
  puller-out/          <- local puller artifacts, already ignored
  .california-agentic/ <- local agentic shell, newly ignored (v0.0.6)
  .env                 <- secrets, already ignored
  ...
```

All ignored paths remain outside the tracked repository and are safe to keep locally without
risk of accidental commit.

## What Changed In Detail

### .gitignore Entry

A single line was added to the local-exclusion block:

```text
.california-agentic/
```

This causes Git to treat the entire directory and all its contents as untracked and unstagedable.

### README Version Marker

The README version marker now reads `v0.0.6`.

### Version Documentation Pointer

The README current-state section now points to this document for the ignore-file update.

### Changelog Entry

The changelog now records the ignore entry addition, README version bump, README documentation pointer update,
and this detailed version document.

## Acceptance Notes

This version is ready when:

- `.gitignore` contains `.california-agentic/`
- `README.md` version marker reads `v0.0.6`
- `CHANGELOG.md` has a `v0.0.6` entry
- `SECURITY.md`, `CONTRIBUTING.md`, and `CODE_OF_CONDUCT.md` remain untouched
- `git diff --check` reports no whitespace issues
- `git status` does not list the agentic shell directory as an untracked file

## Verification Commands

Run these from the repository root.

```powershell
git diff -- .gitignore README.md CHANGELOG.md docs/version-0.0.6-docs.md
```

Use this to inspect the complete patch for this version.

```powershell
rg -n "\.california-agentic|Version: v0.0.6|version-0.0.6-docs" .gitignore README.md CHANGELOG.md docs/version-0.0.6-docs.md
```

Use this to confirm the ignore entry, version marker, and version-document references.

```powershell
git diff --check
```

Use this to catch trailing whitespace or patch formatting issues.

## Pitfalls And Debugging

### Directory Still Appears in `git status`

Confirm the path in `.gitignore` matches the actual directory name exactly, including the leading dot.
Git ignore patterns are case-sensitive on Linux/macOS.

### Unrelated Files Were Accidentally Staged

Run `git diff --staged` and verify only the four expected files appear.
Unstage anything outside the change scope before committing.

### Version Marker Not Updated

Search `README.md` for `Version: v0` and confirm the line reads `v0.0.6`.

## Practice Drill

Before committing ignore-file updates:

1. Verify the new pattern matches the intended directory (use `git check-ignore -v <path>`).
2. Confirm no existing tracked files are accidentally matched by the new pattern.
3. Confirm the staged change set contains only the files expected for this version.

Self-check:

- `.california-agentic/` is ignored
- no tracked files were removed from version control
- no application source was changed

## Mini Competency Map

- Level 1: Can add a `.gitignore` entry and verify it takes effect.
- Level 2: Can confirm a new pattern does not shadow or collide with tracked files.
- Level 3: Can scope a repository hygiene commit cleanly with correct documentation.
- Level 4: Can review an ignore-file change for unintended side effects on tracked paths.

## Next 24-72 Hours

1. Commit the ignore-file update after review.
2. Confirm the agentic shell directory does not reappear in `git status` after pushing.
3. Continue design and implementation work for the Sureplus application stack.
