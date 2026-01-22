---
description: Reloads Superpowers configuration by re-reading Rules, Workflows, and Skills from disk.
---

# Superpowers Reload

## Workflow

Read these directories from disk and summarize what you loaded:

1. `.agent/rules/` — List all rules files and their key points
2. `.agent/workflows/` — List all available slash commands with descriptions
3. `.agent/skills/` — List skill names and their purposes (if any exist)

## Output format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SUPERPOWERS ► CONFIGURATION RELOADED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RULES
─────
• superpowers.md — Plan gate, verification, TDD, safety, project rules

WORKFLOWS (Slash Commands)
──────────────────────────
• /superpowers-brainstorm — Explore ideas before planning
• /superpowers-write-plan — Create plan requiring approval
• /superpowers-execute-plan — Execute approved plan step-by-step
• /superpowers-debug — Systematic debugging
• /superpowers-review — Code review with severity levels
• /superpowers-finish — Final verification and summary
• /superpowers-reload — This command (reload config)
• /pause — Save session state for later
• /resume — Restore from previous session
• /progress — Check current position

SKILLS
──────
• (List any skills found, or "None configured")

───────────────────────────────────────────────────────

✅ Configuration loaded. Will follow latest versions.

───────────────────────────────────────────────────────
```

## Confirmation

After listing, confirm you will follow the latest versions in this session.

Stop after confirming.
