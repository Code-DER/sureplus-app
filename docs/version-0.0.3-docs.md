# Version v0.0.3 Documentation

## Quick Diagnostic Read

This version updates the README presentation only.
The badge row at the top of the repository README now renders centered instead of left-aligned.

You are looking at the correct version if:

- `README.md` shows version `v0.0.3`
- the top badges are wrapped in a centered HTML paragraph
- the proprietary license badge remains static
- unused badge reference definitions were removed from the bottom of `README.md`
- `CHANGELOG.md` has a `v0.0.3` entry for the README badge layout update

## One-Sentence Objective

Version `v0.0.3` improves the README's first-screen visual alignment by centering the badge row while preserving the existing repository links and proprietary license badge.

## Why This Version Matters

The README is the first project surface most reviewers see.
A left-aligned badge row looked visually disconnected from the centered project image and title area.

This update makes the top section more consistent without changing the product scope, license terms, governance rules, security policy, or application behavior.

## Plan A / Plan B

### Plan A: Visual Review

1. Open the rendered README on GitHub.
2. Confirm the badge row is centered above the screenshot.
3. Confirm each badge still links to the expected repository page.
4. Confirm the license badge says `proprietary`.
5. Confirm no badge reference text appears at the bottom of the rendered README.

### Plan B: Source Review

1. Open `README.md`.
2. Confirm the badge row uses `<p align="center">`.
3. Confirm each badge is an `<a>` link containing an `<img>` tag.
4. Confirm the screenshot still uses the remaining `[product-screenshot]` reference.
5. Confirm old badge reference definitions were removed.

## System View

The README top section now has this structure:

```text
readme-top anchor
  -> centered badge row
  -> screenshot link
  -> centered project title and status block
  -> table of contents
```

Only README presentation changed.
No application code, runtime dependency, license file, security policy, contribution policy, or code-of-conduct behavior changed in this version.

## What Changed In Detail

### Centered Badge Row

The top badges were converted from plain Markdown reference links to inline HTML links inside:

```html
<p align="center">
  ...
</p>
```

GitHub README rendering supports this pattern and centers the badges as a group.

### Badge Links Preserved

The converted badges still point to:

- contributors graph
- forks network
- stargazers page
- issues page
- `LICENSE.txt`

### Proprietary Badge Preserved

The license badge remains a static proprietary badge.
This avoids dynamic license detection that can misrepresent custom proprietary notices.

### Dead Reference Cleanup

The old badge reference definitions were removed from the bottom of the README because they are no longer used after the conversion to inline HTML.
The screenshot reference remains because the project screenshot still uses `[product-screenshot]`.

## Acceptance Notes

This version is ready when:

- the README top badge row is centered in the rendered page
- the badge links still open the intended GitHub pages
- the proprietary badge remains visible
- `git diff --check` reports no whitespace issues
- no unrelated docs, policy files, source files, or generated artifacts are changed

## Verification Commands

Run these from the repository root.

```powershell
git diff -- README.md
```

Use this to inspect the README-only presentation change.

```powershell
git diff --check
```

Use this to catch trailing whitespace or patch formatting issues.

```powershell
git status --short --branch
```

Use this to confirm the final commit candidate.

## Pitfalls And Debugging

### Badges Still Render Left-Aligned

Confirm the badges are inside `<p align="center">`.
Plain Markdown badges at the top of a README render left-aligned by default.

### Screenshot Reference Breaks

Do not remove `[product-screenshot]`.
Only the old badge reference definitions became unused.

### License Badge Reverts To Detected Metadata

Keep the license badge static.
The project uses a custom proprietary notice, so dynamic license detection can be misleading.

## Practice Drill

Before committing README presentation changes:

1. Preview the README in GitHub or a Markdown renderer that supports GitHub HTML.
2. Click each badge link.
3. Confirm the screenshot still renders.
4. Run `git diff --check`.

Self-check:

- the visual change is intentional and scoped
- no policy or license wording changed
- no generated files were introduced

## Mini Competency Map

- Level 1: Can identify the rendered README alignment issue.
- Level 2: Can use GitHub-compatible HTML inside Markdown when plain Markdown cannot express layout.
- Level 3: Can clean up unused reference definitions without breaking remaining image references.
- Level 4: Can keep README presentation changes scoped and reviewable.

## Next 24-72 Hours

1. Commit the README badge layout update after review.
2. Confirm the centered badge row renders correctly on GitHub after pushing.
3. Continue with requirements or implementation work without changing the license and governance baseline.
