# Superpowers Rules (Always-On)

These rules apply to ALL work unless the user explicitly opts out.

---

## Core Workflow Rules

### 1) Plan Gate for Non-Trivial Work

If the task is anything beyond a tiny change, do NOT edit code immediately.
You MUST:

1. Brainstorm briefly (goal, constraints, risks, acceptance criteria)
2. Write a step-by-step plan with verification steps
3. Ask the user to approve the plan

Only after approval may you implement.

#### Execute-plan Gate

After the user approves a plan, do NOT begin implementation automatically.
You MUST pause and instruct the user to run: `/superpowers-execute-plan`

Only begin implementation after `/superpowers-execute-plan` is invoked,
unless the user explicitly says to proceed without it.

#### What Counts as "Tiny"?

- Single-file change
- Obvious edit
- Low risk

Even then: do a mini-plan (3–5 steps) and include verification.

### 2) Verification is Mandatory

After implementation, you MUST provide:

- Exact commands to verify (tests/lint/run)
- Results if you were able to run them

### 3) Prefer TDD / Regression Tests

- If fixing a bug: add a regression test if practical
- If adding behavior: add/adjust tests when practical

If tests aren't feasible, provide a concrete alternative verification path.

### 4) Review Pass Required

Before final response, do a review pass and list issues by severity:

- Blocker / Major / Minor / Nit

### 5) Safety

- Never log secrets
- Add timeouts, retries, and idempotency for API automations
- Fail safe (no silent data loss)

---

## Artifact Persistence (Mandatory)

Any brainstorm, plan, review, or finish output must be written to disk under:
`artifacts/superpowers/`

Do not leave these as IDE-only documents.
After writing, confirm the file exists.

### Persistence Enforcement

When a workflow requires saving an artifact to `artifacts/superpowers/`, you MUST ensure the file exists on disk.

Preferred method: Use `write_to_file` tool to create the artifact.
If you cannot create files, instruct the user to save the output manually.

---

## Project-Specific Rules (smalltalk.community)

> **MANDATORY**: These rules are in addition to the workflow rules above and must ALWAYS be followed.

### User Age Requirements

- **Minimum age**: 13 years old
- **Age groups**: Teen (13-17), Adult (18-64), Senior (65+)
- **NO** parental consent system (removed)
- **NO** `child` age group

### SDK Requirements

```javascript
// ✅ CORRECT
import { GoogleGenerativeAI } from '@google/genai';

// ❌ WRONG - DEPRECATED
import { GoogleGenerativeAI } from '@google/generative-ai';
```

### Database Security

- RLS enabled on ALL tables
- Parameterized queries ONLY (never string concatenation)
- Client code: Use `anon` key with RLS
- Server code: Use `service` key (NEVER expose to client)

### Environment Variables

```bash
# ✅ Server-only secrets (no prefix)
SUPABASE_SERVICE_KEY=xxx
GOOGLE_API_KEY=xxx

# ✅ Safe for client (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_APP_URL=xxx

# ❌ NEVER DO THIS
NEXT_PUBLIC_API_KEY=xxx  # Exposes secret to browser!
```

### Input Validation

- ALL inputs validated with Zod schemas
- ALL user content sanitized before storage
- ALL API routes have try/catch error handling

### Content Moderation

- Teen accounts (13-17): Enhanced moderation, stricter AI safety
- All user content: Keyword filter → PII detection → AI safety check

---

## Pre-Commit Checklist

Before committing ANY code:

- [ ] `npm test` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] No `console.log` in production code
- [ ] Sensitive data uses environment variables
- [ ] Error messages don't leak internal details

---

## RED FLAGS - Stop Immediately

If you encounter ANY of these, **STOP** and flag the issue:

| Red Flag | Why It's Critical |
|----------|-------------------|
| Import from `@google/generative-ai` | Deprecated SDK, causes failures |
| Raw SQL with string concatenation | SQL injection vulnerability |
| Missing input validation | Security vulnerability |
| `NEXT_PUBLIC_` for secrets | Exposes keys to browser |
| Service key in client code | Full DB access exposed |
| Missing try/catch on async | Silent failures |
| Missing RLS on tables | Data exposed to all users |

---

## Session State Integration

For long-running work sessions, use the session state commands:

- `/pause` — Save current state for later resumption
- `/resume` — Restore context from previous session
- `/progress` — Check current position and next steps

State is persisted to `.gsd/STATE.md` and `.gsd/JOURNAL.md`.

---

*Adapted from [gemini-superpowers-antigravity](https://github.com/anthonylee991/gemini-superpowers-antigravity)*
*Session state from [get-shit-done-for-antigravity](https://github.com/toonight/get-shit-done-for-antigravity)*
