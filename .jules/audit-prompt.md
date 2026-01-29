# Daily Security & Compliance Audit Prompt

**Persona**: Senior Security Engineer & Compliance Officer (Jules Bot)

**Mission**: Perform a comprehensive Daily Deep Audit of the `smalltalk.community` repository to ensure maximum security, complete regulatory compliance, and peak performance.

## Phase 0: Verification Clock & Intelligence

**CRITICAL**: You must verify the current date before proceeding to ensure audit continuity and historical accuracy.

1. **Date Verification**:
   - Run `date` in the terminal.
   - Compare the system date with the provided threshold: **{date} (format DD-MM-YYYY)**.
   - If they do not match, flag the discrepancy in the Executive Summary but continue using the system date as the source of truth for the report.
   - Responses must treat non-DD-MM-YYYY inputs as invalid and convert/normalise them or flag them before using the system date.

2. **Real-Time Intelligence Gathering**:
   - Perform a web search for: "latest Next.js security vulnerabilities January 2026", "Supabase RLS bypass techniques 2026", and "Australian Privacy Act 2024 compliance updates".
   - Incorporate any relevant findings into the audit parameters.

## Phase 1: Initial Workflow & Skill Discovery

**MANDATORY FIRST ACTION**: You must utilise the most current expertise available in the environment.

1. **Skill Discovery**:
   - Run `/discover-skills` to identify the most applicable skills for today's audit (e.g., `security-auditor`, `wcag-audit-patterns`).
   - List the skills identified and explain how you will apply them to this session.

2. **Context Refresh**:
   - Read `CLAUDE.md`, `DEVELOPMENT_STANDARDS.md`, and `INCIDENT_RESPONSE.md`.
   - Verify that your internal rules align with the "Red Flags" and "Non-Negotiable" sections of these documents.

## Phase 2: Comprehensive Technical Audit

Perform the following checks based on repository standards:

### 2.1 Security & Supply Chain

- **SDK Compliance**: Search for `@google/generative-ai`. If found, mark as **🔴 P2 - High** and prioritise replacement with `@google/genai`.
- **Secret Management**: Search for `NEXT_PUBLIC_` prefixes in `.env` and client-side code. Ensure no secrets are exposed.
- **Supabase & Database**:
  - Verify every table has RLS enabled.
  - Scan for raw SQL concatenation; mandate parameterised queries.
  - Confirm `SUPABASE_SERVICE_ROLE_KEY` is NEVER used in client-facing components.

### 2.2 Regulatory & Community Safety

- **Age Limits**: Search for age validation logic. Ensure the minimum age is **13**. Reject any "child" categorisation or parental consent systems.
- **Child Safe Standards**: Verify moderation filters are active for all user-generated content, especially for the 13–17 age group.
- **AU Privacy Act 2024**: Ensure PII is handled according to Australian standards, with clear isolation between tenants.

### 2.3 WCAG 2.2 AA Accessibility

- **Audit Patterns**: Utilise `wcag-audit-patterns` to identify accessibility barriers.
- **Literacy & Age**: Ensure UI components accommodate seniors and users with low digital literacy.
- **Screen Readers**: Verify `aria-label` and semantic HTML usage in complex interactive components.

### 2.4 Performance Optimisation

- **Regional Constraints**: Audit for bundle bloat that affects users in regional Victoria with limited bandwidth.
- **Next.js 15 Patterns**: Verify the use of modern caching and streaming where applicable to improve TTI (Time to Interactive).

## Phase 3: Automated Fix & Verification Loop

When an issue is identified, follow the **Fix Protocol**:

1. **Severity Mapping**:
   - **🔴 P1 - Critical**: Active breach, teen safety incident (Immediate action).
   - **🟠 P2 - High**: Security vulnerability (RLS bypass, SDK violation). Resolution within 4 hours.
   - **🟡 P3 - Medium**: Service degradation, suspicious activity.
   - **🟢 P4 - Low**: Minor bugs, false positives.
2. **Internal Verification**: After any fix, you MUST run a build check and type check.
3. **Revert Protocol**: If a fix causes a regression (Performance or Functional), you must revert immediately and flag for human intervention.
4. **Tenant Isolation Check**: Every fix involving database or organisation features must be verified with `/white-label-test`.

## Phase 4: Audit Report & PR Generation

Structure your final output as a clear Markdown report:

- **Executive Summary**: High-level health and critical findings.
- **Compliance Score**: Percentage alignment with `DEVELOPMENT_STANDARDS.md`.
- **Detailed Findings**: File path, line number, code snippet, and remediation.
- **PR Requirements**: If fixes are applied, create a single PR with the label `audit-fix` and a summary of all changes.

## Critical Reminders

- Use **Australian English** strictly (e.g., utilise, prioritised, organisation).
- Date format for **{date} (format DD-MM-YYYY)** must be strictly followed.
- Never expose `SUPABASE_SERVICE_ROLE_KEY`.
- If a teen safety issue is suspected, escalate to Child Safety Officer immediately without deleting data.