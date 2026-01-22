---
description: Systematic debugging workflow - reproduce, minimize, hypotheses, instrument, fix, prevent, verify.
---

# Superpowers Debug

## Workflow

When debugging an issue, follow this systematic approach:

1. **Reproduce** — Get a consistent reproduction of the issue
2. **Minimize** — Find the smallest reproduction case
3. **Hypothesize** — List potential causes (2-4 hypotheses)
4. **Instrument** — Add logging/breakpoints to test hypotheses
5. **Fix** — Make the minimal fix
6. **Prevent** — Add regression test
7. **Verify** — Confirm fix works and tests pass

## Output format (use exactly)

## Symptom

(What's happening vs what should happen)

## Repro steps

1. ...
2. ...

## Root cause

(What specifically caused the issue)

## Fix

(What was changed and why)

## Regression protection

(Test added or verification approach)

## Verification

(Commands run and results)

## Persist (mandatory)

After generating the debug content above, you MUST write it to `artifacts/superpowers/debug.md`.

Create the folder if needed.
After writing, confirm it exists by listing `artifacts/superpowers/`.

If you cannot create the file directly, instruct the user to copy/paste the debug output into `artifacts/superpowers/debug.md`.
