---
description: Superpowers brainstorm. Produces goal/constraints/risks/options/recommendation/acceptance criteria.
---

# Superpowers Brainstorm

## Task

Brainstorm for this task (exactly as provided by the user):
**{{input}}**

> **Note**: The `{{input}}` token is a runtime placeholder that the calling agent
> substitutes with the user's actual task description. It is not a code variable.
> If the token appears empty or unsubstituted at runtime, the workflow will prompt
> the user to restate their task.

If `{{input}}` is empty or missing, ask the user to restate the task in one sentence and STOP.

## Skills Discovery (Checkpoint 1)

Before brainstorming, check for applicable skills:

1. Run `/discover-skills` OR manually check:

   ```bash
   # turbo
   git clone --depth 1 https://github.com/rmyndharis/antigravity-skills.git /tmp/antigravity-skills 2>/dev/null || git -C /tmp/antigravity-skills pull --ff-only
   ```

2. Search catalog for relevant keywords
3. Note applicable skills for inclusion in output

## Output sections (use exactly)

## Goal

## Constraints

## Known context

## Risks

## Options (2–4)

## Recommendation

## Acceptance criteria

## Applicable Skills

| Skill | Category | Justification |
|-------|----------|---------------|
| (skill-name) | (category) | (why it applies) |

(If no skills apply, state "None identified")

## Persist (mandatory)

After generating the brainstorm content, you MUST write it to disk:

1) Output the brainstorm markdown content first (the sections above).
2) Write the content to `artifacts/superpowers/brainstorm.md`

Create the folder if needed.
After writing, confirm it exists by listing `artifacts/superpowers/`.

If you cannot create the file directly, instruct the user to copy/paste the brainstorm output into `artifacts/superpowers/brainstorm.md`.

Do not implement changes in this workflow. Stop after persistence.
