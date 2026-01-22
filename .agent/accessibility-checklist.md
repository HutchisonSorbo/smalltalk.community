# Accessibility Quick Reference Checklist

Use this checklist when making UI changes to ensure WCAG 2.2 AA compliance.

## Visual Design

- [ ] **Colour contrast**: 4.5:1 for normal text, 3:1 for large text (18pt+)
- [ ] **Font size**: Minimum 16px for body text
- [ ] **Don't rely on colour alone**: Use icons, patterns, or text labels
- [ ] **Focus indicators**: Visible focus ring on all interactive elements

## Keyboard Navigation

- [ ] **Tab order**: Logical flow (left-to-right, top-to-bottom)
- [ ] **All elements reachable**: Every interactive element accessible via Tab
- [ ] **No keyboard traps**: Users can Tab away from any element
- [ ] **Skip links**: Provide "Skip to main content" link

## Screen Readers

- [ ] **Alt text**: All images have descriptive alt attributes
- [ ] **ARIA labels**: Interactive elements have `aria-label` or `aria-labelledby`
- [ ] **Heading hierarchy**: Single h1, logical h2→h3→h4 structure
- [ ] **Landmarks**: Use `<main>`, `<nav>`, `<aside>`, `<footer>` appropriately
- [ ] **Live regions**: Use `aria-live` for dynamic content updates

## Forms

- [ ] **Labels**: Every input has an associated `<label>` element
- [ ] **Error messages**: Clear, specific, and associated with the field
- [ ] **Required fields**: Marked with `aria-required="true"`
- [ ] **Validation feedback**: Immediate and non-blocking

## Content (Seniors/Low Digital Literacy)

- [ ] **Plain language**: Reading level ≤ Year 8
- [ ] **Clear instructions**: Tell users what to do, not just what went wrong
- [ ] **No jargon**: Avoid technical terms without explanation
- [ ] **Consistent navigation**: Same layout across all pages

## Touch Targets (Mobile)

- [ ] **Minimum size**: 44×44 CSS pixels for all interactive elements
- [ ] **Adequate spacing**: At least 8px between touch targets
- [ ] **No hover-only interactions**: All hover effects have touch equivalents

## Motion and Timing

- [ ] **No auto-play**: Videos/audio don't start automatically
- [ ] **No time limits**: Allow unlimited time for form completion
- [ ] **Reduced motion**: Respect `prefers-reduced-motion` media query
- [ ] **Pause controls**: Any moving/blinking content can be paused

## Testing Tools

```bash
# Playwright accessibility test
npx playwright test --grep @accessibility

# Lighthouse accessibility audit
npx lighthouse https://localhost:3000 --only-categories=accessibility

# axe-core CLI
npx axe https://localhost:3000
```

## Online Resources

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)
- [WAVE Web Accessibility Evaluation Tool](https://wave.webaim.org/)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)
