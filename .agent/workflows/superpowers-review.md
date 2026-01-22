---
description: Runs a Superpowers-style review pass with severity levels.
---

# Superpowers Review

## Workflow

Review the current work and categorize issues by severity:

### Severity Levels

- **Blockers** — Must fix before merging (security issues, broken functionality, data loss risks)
- **Majors** — Should fix before merging (significant bugs, missing edge cases)
- **Minors** — Can fix in follow-up (cosmetic issues, minor improvements)
- **Nits** — Optional improvements (style preferences, micro-optimizations)

## Output format (use exactly)

## Blockers

(List each issue with file and line if applicable)

## Majors

(List each issue)

## Minors

(List each issue)

## Nits

(List each issue)

## Summary

(Overall assessment)

## Next actions

(What needs to happen next)

## Persist (mandatory)

After generating the review content above, you MUST write it to `artifacts/superpowers/review.md`.

Create the folder if needed.
After writing, confirm it exists by listing `artifacts/superpowers/`.

If you cannot create the file directly, instruct the user to copy/paste the review output into `artifacts/superpowers/review.md`.
