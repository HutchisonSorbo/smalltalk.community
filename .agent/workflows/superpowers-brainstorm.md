---
description: Superpowers brainstorm. Produces goal/constraints/risks/options/recommendation/acceptance criteria.
---

# Superpowers Brainstorm

## Task

Brainstorm for this task (exactly as provided by the user):
**{{input}}**

If `{{input}}` is empty or missing, ask the user to restate the task in one sentence and STOP.

## Output sections (use exactly)

## Goal

## Constraints

## Known context

## Risks

## Options (2–4)

## Recommendation

## Acceptance criteria

## Persist (mandatory)

After generating the brainstorm content, you MUST write it to disk:

1) Output the brainstorm markdown content first (the sections above).
2) Write the content to `artifacts/superpowers/brainstorm.md`

Create the folder if needed.
After writing, confirm it exists by listing `artifacts/superpowers/`.

If you cannot create the file directly, instruct the user to copy/paste the brainstorm output into `artifacts/superpowers/brainstorm.md`.

Do not implement changes in this workflow. Stop after persistence.
