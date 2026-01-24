---
description: Show current position in roadmap and next steps
---

# /progress Workflow

## Process

### 1. Load Current State

Read:

- `.gsd/STATE.md` — Current position
- `artifacts/superpowers/plan.md` — Current plan (if exists)

---

### 2. Display Status

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PROGRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT STATUS
──────────────
{Summary from STATE.md or "No active session"}

───────────────────────────────────────────────────────

CURRENT PLAN
────────────
{If artifacts/superpowers/plan.md exists, show goal and step summary}
{Otherwise: "No active plan. Run /superpowers-write-plan to create one."}

───────────────────────────────────────────────────────

EXECUTION PROGRESS
──────────────────
{If artifacts/superpowers/execution.md exists, show completed steps}
{Otherwise: "No execution in progress."}

───────────────────────────────────────────────────────

BLOCKERS
────────
{Blockers from STATE.md, or "None"}

───────────────────────────────────────────────────────

▶ NEXT UP

{Recommended next action based on state}

───────────────────────────────────────────────────────
```

---

### 3. Suggest Action

Based on status, recommend:

| State | Recommendation |
|-------|----------------|
| No plan exists | `/superpowers-write-plan` to begin |
| Plan exists, not approved | Ask user to review and approve |
| Plan approved, not started | `/superpowers-execute-plan` to begin |
| Execution in progress | Continue with next step |
| Execution complete | `/superpowers-finish` to wrap up |
| Debugging needed | `/superpowers-debug` |
| Review needed | `/superpowers-review` |
