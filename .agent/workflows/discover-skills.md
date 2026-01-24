---
description: Discover and understand available skills from antigravity-skills
---

## Purpose

Browse the antigravity-skills repository to identify skills applicable to the current task.

## Skills Repository Access

Uses hybrid caching with conditional requests:

1. Clone locally once (shallow clone for speed)
2. Use ETag/If-None-Match for subsequent checks
3. Cache expiry: refresh every 4 hours or at each checkpoint

## Steps

1. Clone or update the antigravity-skills repository

   ```bash
   # turbo
   git clone --depth 1 https://github.com/rmyndharis/antigravity-skills.git /tmp/antigravity-skills 2>/dev/null || git -C /tmp/antigravity-skills pull --ff-only
   ```

2. Review the catalog
   - Read `/tmp/antigravity-skills/CATALOG.md` for category overview
   - Categories: architecture, business, data-ai, development, general, infrastructure, security, testing, workflow

3. Search for applicable skills

   ```bash
   # turbo
   grep -i "<keyword>" /tmp/antigravity-skills/CATALOG.md
   ```

4. Read SKILL.md for promising matches

   ```bash
   # turbo
   cat /tmp/antigravity-skills/skills/<skill-name>/SKILL.md
   ```

5. Document findings in task artifacts

## Output

| Skill | Category | Justification |
|-------|----------|---------------|
| (skill-name) | (category) | (why it applies to current task) |

## Checkpoint Integration

This workflow is called at three checkpoints:

- **Checkpoint 1**: During `/superpowers-brainstorm`
- **Checkpoint 2**: During `/superpowers-write-plan`
- **Checkpoint 3**: Before `/superpowers-execute-plan` starts
