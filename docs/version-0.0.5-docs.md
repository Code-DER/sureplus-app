# Version v0.0.5 Documentation

## Quick Diagnostic Read

This version updates the README proprietary license badge color only.
The badge now uses a red Shields.io color instead of the previous gray treatment.

You are looking at the correct version if:

- `README.md` shows version `v0.0.5`
- the license badge URL contains `license-proprietary-red.svg`
- the old badge URL no longer contains `license-proprietary-lightgrey.svg`
- `CHANGELOG.md` has a `v0.0.5` entry for the badge color update
- this file exists at `docs/version-0.0.5-docs.md`

## One-Sentence Objective

Version `v0.0.5` makes the proprietary license badge visually stronger by changing the static badge color from gray to red.

## Why This Version Matters

The repository uses a proprietary license notice.
A red badge makes that status more visually explicit in the README badge row, reducing the chance that readers skim past the license constraint.

This is a documentation presentation update only.
It does not change license terms, contribution rules, security reporting, project scope, runtime behavior, or repository structure.

## Plan A / Plan B

### Plan A: Rendered README Review

1. Open the rendered README.
2. Confirm the badge row remains centered.
3. Confirm the license badge still says `license proprietary`.
4. Confirm the proprietary badge now renders red.
5. Confirm clicking the badge still opens `LICENSE.txt`.

### Plan B: Source Review

1. Open `README.md`.
2. Find the badge row near the top of the file.
3. Confirm the license badge uses `https://img.shields.io/badge/license-proprietary-red.svg?style=for-the-badge`.
4. Confirm the badge link still targets `https://github.com/Code-DER/sureplus-app/blob/main/LICENSE.txt`.
5. Confirm no other badge URLs or policy files changed.

## System View

The README badge row now has this visual intent:

```text
contributors -> forks -> stars -> issues -> red proprietary license badge
```

The license badge remains a static Shields.io badge.
That is intentional because dynamic license detection can misrepresent custom proprietary licensing.

## What Changed In Detail

### License Badge Color

The README changed this badge URL segment:

```text
license-proprietary-lightgrey.svg
```

to this:

```text
license-proprietary-red.svg
```

The label, link target, alt text, and badge style remain unchanged.

### README Version Marker

The README version marker now reads `v0.0.5`.

### Version Documentation Pointer

The README current-state section now points to this document for the badge color update.

### Changelog Entry

The changelog now records the badge color change, README version bump, README documentation pointer update, and this detailed version document.

## Acceptance Notes

This version is ready when:

- the README proprietary badge renders red
- the badge still links to `LICENSE.txt`
- the license text in `LICENSE.txt` remains unchanged
- `SECURITY.md`, `CONTRIBUTING.md`, and `CODE_OF_CONDUCT.md` remain untouched
- `git diff --check` reports no whitespace issues

## Verification Commands

Run these from the repository root.

```powershell
git diff -- README.md CHANGELOG.md docs/version-0.0.5-docs.md
```

Use this to inspect the complete documentation patch.

```powershell
rg -n "license-proprietary-(red|lightgrey)|Version: v0.0.5|version-0.0.5-docs" README.md CHANGELOG.md docs/version-0.0.5-docs.md
```

Use this to confirm the new badge color, version marker, and version-document references.

```powershell
git diff --check
```

Use this to catch trailing whitespace or patch formatting issues.

## Pitfalls And Debugging

### Badge Still Looks Gray

Confirm the rendered README is refreshed and the badge URL contains `red.svg`.
Browser or GitHub image caching can briefly show an older badge.

### License Meaning Accidentally Changes

Only the Shields.io color token should change.
Do not modify `LICENSE.txt` or the README license section for this presentation-only update.

### Dynamic License Badge Returns

Keep the badge static.
The project uses custom proprietary wording, so a dynamic GitHub license badge can show misleading metadata.

## Practice Drill

Before committing badge presentation changes:

1. Search the README for the old color token.
2. Verify the new badge URL directly.
3. Click the rendered badge link.
4. Confirm the changelog describes presentation only, not a licensing-policy change.

Self-check:

- the badge color changed
- the badge meaning stayed the same
- no policy files changed

## Mini Competency Map

- Level 1: Can identify a static Shields.io badge URL.
- Level 2: Can safely change a badge color without changing its target or meaning.
- Level 3: Can keep README presentation changes scoped and documented.
- Level 4: Can distinguish visual license signaling from legal license changes.

## Next 24-72 Hours

1. Commit the badge color update after review.
2. Confirm the badge renders red on GitHub after pushing.
3. Continue implementation work without changing the proprietary license baseline unless the team formally approves a license update.
