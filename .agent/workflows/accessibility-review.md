---
description: Run accessibility compliance checks with stop-on-failure enforcement
---

## Purpose

Systematically verify WCAG 2.2 AA compliance for UI changes. Agent STOPS if violations found.

> [!CAUTION]
> This workflow enforces a hard gate. Agent cannot proceed until all tests pass.

## Prerequisites

- `@axe-core/playwright` or equivalent installed
- Browser testing capability available
- Dev server running

## Steps

### 1. Identify Components to Test

List all pages/components changed in current task:

- [ ] (page/component 1)
- [ ] (page/component 2)

### 2. Run Automated axe-core Scan

```bash
npx playwright test --grep @accessibility
```

Or use browser-based scan:

```javascript
```typescript
// In Playwright test
import { AxeBuilder } from '@axe-core/playwright';

test('accessibility check', async ({ page }) => {
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### 3. Gate: Check Results

> [!CAUTION]
> **STOP-ON-FAILURE**: If ANY violations found:
>
> 1. ❌ STOP execution immediately
> 2. Document violation details
> 3. Implement fix for each violation
> 4. Re-run step 2
> 5. Repeat until zero violations

**Violation Documentation Format:**

| Element | Rule | Impact | Fix Applied |
|---------|------|--------|-------------|
| (selector) | (axe rule id) | (critical/serious/moderate) | (description of fix) |

### 4. Manual Keyboard Navigation Test

- [ ] Tab order is logical (left-to-right, top-to-bottom)
- [ ] All interactive elements reachable via keyboard
- [ ] Focus indicators clearly visible
- [ ] No keyboard traps
- [ ] Skip links functional (if present)

### 5. Screen Reader Verification (if applicable)

Test with VoiceOver (macOS) or NVDA (Windows):

- [ ] Content announced in logical order
- [ ] Images have descriptive alt text
- [ ] Form fields have associated labels
- [ ] Headings hierarchy is correct (h1 → h2 → h3)
- [ ] ARIA landmarks used appropriately

### 6. Colour Contrast Check

- [ ] Normal text: 4.5:1 minimum contrast ratio
- [ ] Large text (18pt+): 3:1 minimum contrast ratio
- [ ] UI components: 3:1 minimum contrast ratio
- [ ] Focus indicators: 3:1 minimum contrast ratio

Use: <https://webaim.org/resources/contrastchecker/>

### 7. Senior/Low Digital Literacy Considerations

- [ ] Language is plain and clear (reading level ≤ Year 8)
- [ ] Error messages explain what to do, not just what went wrong
- [ ] Interactive elements are large enough (44×44 CSS pixels minimum)
- [ ] No time limits or auto-advancing content
- [ ] Consistent navigation across pages

## Output

### Test Report

| Check | Result | Notes |
|-------|--------|-------|
| axe-core scan | ✅/❌ | (violation count or "passed") |
| Keyboard navigation | ✅/❌ | (issues found) |
| Screen reader | ✅/❌ | (issues found) |
| Colour contrast | ✅/❌ | (issues found) |
| Senior-friendly | ✅/❌ | (issues found) |

### Violations Fixed

| Issue | Fix Applied | Verified |
|-------|-------------|----------|
| (description) | (fix description) | ✅ |

## Related Skills

From antigravity-skills repository:

- `wcag-audit-patterns` - WCAG 2.2 audits with automated testing
- `accessibility-compliance-accessibility-audit` - Inclusive design patterns
- `screen-reader-testing` - VoiceOver, NVDA, JAWS testing
- `ui-visual-validator` - Visual validation and compliance
