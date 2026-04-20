# Version v0.0.2 Documentation

## Quick Diagnostic Read

This version corrects the repository license metadata and documentation.
The previous scaffold used incorrect open-source license wording and a dynamic license-detection badge, but the project should be proprietary and confidential under the Sureplus Website Development Team notice.

You are looking at the correct version if:

- `README.md` shows version `v0.0.2`
- the README badge says `Proprietary`
- the README license section says the project is proprietary and confidential
- `LICENSE.txt` starts with `All Rights Reserved`
- `CHANGELOG.md` has a `v0.0.2` entry for the license correction
- `docs/version-0.0.1-docs.md` no longer claims open-source licensing

## One-Sentence Objective

Version `v0.0.2` aligns the repository license file, README badge, changelog, and version documentation with the intended proprietary all-rights-reserved project notice.

## Why This Version Matters

License text is not cosmetic.
It defines what readers, contributors, classmates, reviewers, and downstream recipients may believe they are allowed to do with the repository.

The previous license text was incorrect for this project because it described permissive open-source terms.
That conflicted with the intended proprietary and confidential terms.

This version fixes that mismatch before implementation work starts, reducing the risk that someone interprets the repository as open-source or reusable when it is not.

## Plan A / Plan B

### Plan A: Maintainer Review

1. Open `LICENSE.txt`.
2. Confirm it contains the Sureplus Website Development Team proprietary notice.
3. Open `README.md`.
4. Confirm the license badge is static and says `Proprietary`.
5. Confirm the README license section points readers to `LICENSE.txt`.
6. Check `CHANGELOG.md` for the `v0.0.2` entry.
7. Check this file for the detailed correction notes.

### Plan B: Contributor Orientation

1. Treat the project as proprietary and confidential.
2. Do not copy, transfer, reproduce, reuse, or redistribute the source unless the development team gives permission.
3. Use `LICENSE.txt` as the source-of-truth notice for project rights.
4. Use `SECURITY.md` for coordinated vulnerability handling.
5. Use `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` for collaboration expectations.

## System View

The license correction affects four documentation surfaces:

```text
LICENSE.txt
  -> source-of-truth proprietary notice

README.md
  -> visible badge and plain-English license summary

CHANGELOG.md
  -> version history and deletion-candidate tracking

docs/version-0.0.1-docs.md + docs/version-0.0.2-docs.md
  -> detailed version context and correction record
```

This change does not add application code, runtime dependencies, database schema, tests, deployment configuration, or operational behavior.

## What Changed In Detail

### License File

`LICENSE.txt` was changed from open-source license text to the proprietary all-rights-reserved notice supplied for this project.

The new notice states that:

- the project contents are proprietary and confidential
- unauthorized copying, transferring, or reproduction is prohibited
- possession of source code does not imply a right to use it beyond the purpose for which it was provided
- the software is provided as-is without warranty
- authors and copyright holders are not liable for claims or damages related to use of the software

### README Badge

The README previously used a dynamic license-detection badge.

That badge depended on the hosting platform recognizing a standard repository license.
For a custom proprietary notice, the detected value can be misleading in the README even when `LICENSE.txt` exists.

The badge now uses a static Shields URL:

```text
img.shields.io/badge/license-proprietary-lightgrey.svg
```

This correctly reflects the repository's intended license status without depending on GitHub's license classifier.

### README License Section

The README license section now says the project is proprietary and confidential, with all rights reserved by the Sureplus Website Development Team.
It points readers to `LICENSE.txt` for the complete notice.

### Changelog

`CHANGELOG.md` now includes a `v0.0.2` entry describing the license correction.
The previous `v0.0.1` wording was also corrected so the initial scaffold entry no longer claims open-source licensing.

### Previous Version Documentation

`docs/version-0.0.1-docs.md` was corrected to refer to the proprietary license notice instead of open-source licensing.
This keeps the historical scaffold documentation aligned with the actual intended license.

## Acceptance Notes

This version is ready when:

- the repository has no remaining open-source license claims
- the README does not use a dynamic license-detection badge endpoint
- the README badge visibly says `Proprietary`
- `LICENSE.txt` contains the all-rights-reserved notice
- `CHANGELOG.md` records the correction under `v0.0.2`
- no build artifacts or generated outputs are introduced

## Verification Commands

Run these from the repository root.

Use ripgrep to search the repository documentation for stale open-source license names, dynamic license badge endpoints, or misleading detected-license text.
The expected result is no active license metadata that contradicts the proprietary notice.

Review the current diff:

```powershell
git diff --staged --stat
git diff --staged -- README.md CHANGELOG.md LICENSE.txt docs/version-0.0.1-docs.md docs/version-0.0.2-docs.md
```

Check for whitespace issues:

```powershell
git diff --check --staged
```

## Pitfalls And Debugging

### The Badge Still Says Not Specified

If the badge shows misleading license metadata, the README is probably still using a dynamic license-detection endpoint.
Use a static badge for proprietary licensing.

### The License File Is Present But GitHub Does Not Classify It

That is normal for custom proprietary notices.
GitHub license detection is optimized around known open-source license texts.

### The README And LICENSE Disagree

Treat `LICENSE.txt` as the source of truth, then update README, changelog, and version docs to match it.

### Open-Source License References Remain In Historical Docs

Search the docs for stale open-source license names.
Historical documentation should not preserve incorrect license claims unless it explicitly describes a past mistake.

## Practice Drill

Before the next implementation commit, do this quick license consistency check:

1. Search for stale license strings.
2. Open the rendered README preview.
3. Confirm the badge says `Proprietary`.
4. Confirm the license section points to `LICENSE.txt`.
5. Confirm changelog and version docs agree.

Self-check:

- no standard open-source license is advertised
- no dynamic license badge reports misleading metadata
- the proprietary notice is the only license source of truth

## Mini Competency Map

- Level 1: Can tell whether the README badge and license file agree.
- Level 2: Can explain why dynamic license detection may misrepresent proprietary notices.
- Level 3: Can correct license metadata across README, changelog, and docs without changing source code.
- Level 4: Can design a repository documentation policy that avoids accidental open-source claims for private or proprietary academic projects.

## Next 24-72 Hours

1. Commit the license correction after review.
2. Confirm GitHub renders the static proprietary badge after the branch is pushed.
3. Continue with requirements and implementation planning under the proprietary project terms.
