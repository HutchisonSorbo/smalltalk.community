---
description: Finalize work - verification, summary, follow-ups, manual validation steps.
---

# Superpowers Finish

## Workflow

Finalize the current work with a comprehensive summary:

1. Run all verification commands
2. Summarize what was changed
3. List any follow-up work needed
4. Document manual validation steps

## Output format (use exactly)

## Verification

(Commands run and their results)

```bash
# Example
npm test
npm run typecheck
npm run lint
```

## Summary of changes

- File 1: What changed
- File 2: What changed
- ...

## Follow-ups

(Future work items, if any)

- [ ] Item 1
- [ ] Item 2

## Manual validation steps

(If applicable, steps to verify the changes manually)

1. Step 1
2. Step 2

## Persist (mandatory)

After generating the finish content above, you MUST write it to `artifacts/superpowers/finish.md`.

Create the folder if needed.
After writing, confirm it exists by listing `artifacts/superpowers/`.

If you cannot create the file directly, instruct the user to copy/paste the finish output into `artifacts/superpowers/finish.md`.
