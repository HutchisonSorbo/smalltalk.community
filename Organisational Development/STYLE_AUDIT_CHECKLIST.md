# App Style Audit Checklist: "Information Hub" Standard

This checklist ensures all 20 smalltalk.community applications align with the premium "Information Hub" design language and Australian English standards.

## 1. Language & Punctuation

- [ ] **Spelling**: Australian English used throughout (e.g., `organisation`, `centre`, `programme`, `colour`, `licence`).
- [ ] **Em Dashes**: NO em dashes (`—`) used. Replaced with commas (`,`) or colons (`:`).
- [ ] **Tone**: Professional, inclusive, and plain English.
- [ ] **Consistency**: Terms like "smalltalk.community Inc" used consistently.

## 2. Visual Design (Information Hub Patterns)

- [ ] **Color Palette**:
  - Slate backgrounds for dark mode (`bg-slate-900`, `dark:bg-slate-900`).
  - Primary colors used for accents (e.g., `#003b6f` for smalltalk.community branding).
- [ ] **Typography**:
  - Clear hierarchy with bold headings.
  - No black text on dark backgrounds.
- [ ] **Cards**: Consistent rounded corners (`rounded-xl` or `rounded-2xl`) and subtle shadows.
- [ ] **Navigation**: Standardised `AppShell` with role selector and theme toggle if applicable.
- [ ] **Micro-animations**: Subtle transitions on hover and theme switching.

## 3. Print Standards

- [ ] **Standardised Footer**: document title, organisation name, Australian-formatted timestamp, and "Page X of Y".
- [ ] **Print Margins**: `@page { margin: 0; }` with body padding for consistent physical margins.

## 4. Accessibility (WCAG 2.1 AA)

- [ ] **Contrast**: Check contrast ratios for all text, especially in dark mode.
- [ ] **ARIA**: Proper `aria-label` on interactive buttons.
- [ ] **Focus States**: High-visibility focus rings on all interactive elements.

## 5. Metadata & Tech Standards

- [ ] **Title**: `<title>` tag matches `smalltalk.community - [App Name]`.
- [ ] **SEO**: Descriptive meta descriptions and single `h1`.
- [ ] **ID Consistency**: Interactive elements have unique, descriptive IDs.
