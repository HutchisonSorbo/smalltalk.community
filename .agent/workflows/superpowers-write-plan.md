---
description: Superpowers plan gate. Writes a small-step plan with files + verification. Must ask for approval before coding.
---

# Superpowers Write Plan (Gate)

## Task

Plan for this task (exactly as provided by the user):
**{{input}}**

If `{{input}}` is empty or missing, ask the user to restate the task in one sentence and STOP.

## Skills Discovery (Checkpoint 2)

Before planning, verify skills from brainstorm and check for additional skills:

1. Review skills identified in brainstorm
2. Run `/discover-skills` or check catalog for additional matches
3. Document confirmed skills in plan output

## Rules

- DO NOT edit code.
- You may read files to understand context, but produce the plan and then stop.
- You can use `./bin/grepai search "query"` to find relevant code context.
- Plan steps must be small (2–10 minutes each) and include verification commands.
- **CHECKPOINT 2**: Verify skills from brainstorm, check for additional skills
- **MANDATORY**: Include accessibility considerations for all UI changes
- **MANDATORY**: Include white-label testing for organisation features
- **STOP-ON-FAILURE**: Plan must include accessibility/white-label gates where applicable

## Output format (use exactly)

## Goal

## Assumptions

## Skills Utilised

| Skill | Usage |
|-------|-------|
| (skill-name) | (how it will be applied) |

(Confirmed list from brainstorm + any new skills discovered)

## Plan

(Each step must include: Files, Change, Verify)

## Accessibility Considerations

(For UI changes: WCAG 2.2 AA compliance approach, senior/low digital literacy accommodations, screen reader compatibility)

## White-Label Testing Approach

(For org features: RLS verification, admin vs non-admin test accounts, tenant isolation verification)

## Stop-on-Failure Gates

- [ ] Accessibility gate (after UI changes) - run `/accessibility-review`
- [ ] White-label gate (after org features) - run `/white-label-test`

## Risks & mitigations

## Rollback plan

## Push (mandatory)

(Instructions to create a NEW branch and push changes using `gh cli` after verified completion)
(Do NOT use an existing branch unless specifically correcting that branch's PR)
(Example: `git checkout -b feat/my-new-feature` -> `gh pr create`)

## Persist (mandatory)

Write the plan output to:

- `artifacts/superpowers/plan.md`

Create the folder if needed.
After writing, confirm it exists by listing `artifacts/superpowers/`.

## Approval

Ask:
**Approve this plan? Reply APPROVED if it looks good.**

If the user replies APPROVED:

- Do NOT implement yet.
- Reply: **"Plan approved. Run `/superpowers-execute-plan` to begin implementation."**

## Persist (mandatory)

After generating the plan content above, you MUST write it to `artifacts/superpowers/plan.md`.

If you cannot create the file directly, instruct the user to copy/paste the plan output into `artifacts/superpowers/plan.md`.

Do not implement changes in this workflow. Stop after persistence.
