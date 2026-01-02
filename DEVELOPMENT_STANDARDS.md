# Development Standards

**Project**: smalltalk.community  
**Type**: Multi-Age Community Platform  
**Infrastructure**: Next.js + Vercel + Supabase + GitHub  
**Last Updated**: 2 January 2026

> **⚠️ Before making ANY code changes, read this document completely.**

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Regulatory Compliance](#2-regulatory-compliance)
3. [Technical Stack](#3-technical-stack)
4. [Security Requirements](#4-security-requirements)
5. [Content Moderation](#5-content-moderation)
6. [Code Standards](#6-code-standards)
7. [Testing Requirements](#7-testing-requirements)
8. [Performance](#8-performance)
9. [Deployment](#9-deployment)

---

## 1. Platform Overview

### Age Requirements

| Requirement | Value |
|-------------|-------|
| **Minimum Age** | 13 years |
| **Age Verification** | Date of birth at registration |
| **Parental Consent** | Not required (13+ only) |

### Age Groups

| Group | Age Range | Features |
|-------|-----------|----------|
| Teen | 13-17 | Enhanced moderation, stricter AI safety |
| Adult | 18-64 | Standard moderation |
| Senior | 65+ | Standard moderation |

### User Types

- **Individuals**: Personal accounts (teens, adults, seniors)
- **Organisations**: Councils, community groups, businesses
- **Professionals**: Musicians, educators, service providers

---

## 2. Regulatory Compliance

### Victorian Child Safe Standards

This platform serves users aged 13-17, requiring compliance with Victorian Child Safe Standards.

| Standard | Requirement | Implementation |
|----------|-------------|----------------|
| 1 | Culturally safe environment | Inclusive design, accessibility |
| 2 | Child safety in governance | Documented policies, oversight |
| 3 | Children's participation | Age-appropriate controls, feedback |
| 4 | Family/community involvement | Community moderation |
| 5 | Equity and diverse needs | Accessibility (WCAG 2.2 AA) |
| 6 | Suitable staff/volunteers | **WWCC required for moderators** |
| 7 | Child-focused complaints | Report system with priority handling |
| 8 | Staff training | Moderation training requirements |
| 9 | Safe online environments | Multi-layer moderation, 13+ age gate |
| 10 | Continuous improvement | Quarterly reviews |
| 11 | Documented policies | This document |

**Regulatory Authority**: Social Services Regulator (Victoria) - effective July 1, 2024

### Australian Privacy Act 2024

| Requirement | Implementation |
|-------------|----------------|
| Data breach notification | Within 72 hours |
| Right to access | User data export |
| Right to deletion | Account deletion with data wipe |
| Automated decision-making | AI moderation disclosed in privacy policy |
| Children's Online Privacy Code | Monitor OAIC guidance for under-18 requirements |

### OWASP Top 10:2025 Alignment

| Category | Implementation |
|----------|----------------|
| A01 Broken Access Control | RLS on all tables, IDOR prevention |
| A02 Security Misconfiguration | Security headers, CSP |
| A03 Supply Chain | npm audit, Dependabot, Snyk |
| A04 Cryptographic Failures | Encrypted at rest/transit |
| A05 Injection | Parameterized queries, input validation |
| A06 Insecure Design | Threat modeling for new features |
| A07 Authentication Failures | 12-char passwords, MFA future |
| A08 Software Integrity | SRI for external scripts |
| A09 Logging Failures | Audit logging, Sentry |
| A10 Exceptional Conditions | Try/catch on all async |

---

## 3. Technical Stack

### SDK Requirements (NON-NEGOTIABLE)

```javascript
// ✅ CORRECT - Use this ONLY
import { GoogleGenerativeAI } from '@google/genai';

// ❌ WRONG - These are deprecated/incorrect
import { GoogleGenerativeAI } from '@google/generative-ai';  // DEPRECATED
import { ... } from '@google-cloud/aiplatform';              // LEGACY
import { ... } from '@google-ai/generativelanguage';         // OUTDATED
```

**Installation**: `npm install @google/genai`

### Supabase Client

```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Client-side (uses anon key with RLS)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Server-side (uses service key, bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
```

### Environment Variables

```bash
# Server-only (no prefix)
GOOGLE_API_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

# Client-safe (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_APP_URL=xxx
```

> **⚠️ NEVER use `NEXT_PUBLIC_` for API keys, secrets, or service credentials.**

---

## 4. Security Requirements

### Authentication

#### Password Requirements

| Requirement | Value |
|-------------|-------|
| Minimum length | **12 characters** |
| Uppercase | At least 1 |
| Lowercase | At least 1 |
| Number | At least 1 |
| Special character | At least 1 |
| No spaces | Start or end |
| No username/email | In password |

#### Account Lockout

| Failed Attempts | Action |
|-----------------|--------|
| 5 | 30-minute lockout |
| 10 | Account locked, email notification |
| 15 | Security team alert |

### Row Level Security (RLS)

**RLS must be enabled on ALL tables.** No exceptions.

```sql
-- Enable RLS on table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Example policy
CREATE POLICY "Users can view active profiles"
  ON users FOR SELECT
  USING (account_status = 'active');
```

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| /api/auth/login | 5 | 15 min |
| /api/auth/register | 3 | 1 hour |
| /api/auth/forgot-password | 3 | 1 hour |
| Content creation | 3/min, 30/hr | Rolling |
| AI generation | 5/min, 50/hr | Rolling |

### Security Headers

Configure in `next.config.mjs`:

```javascript
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];
```

### Next.js 15 Security

Protect against CVE-2025-29927:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (request.headers.has('x-middleware-subrequest')) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  // ... rest of middleware
}
```

---

## 5. Content Moderation

### Moderation Pipeline

All user content passes through:

1. **Keyword Check** - Blocked words list
2. **PII Detection** - Phone, email, address patterns
3. **AI Safety Check** - Google AI content analysis

### Age-Based Moderation

| Age Group | Moderation Level | AI Safety Setting |
|-----------|------------------|-------------------|
| Teen (13-17) | Enhanced - auto-reject flagged | BLOCK_LOW_AND_ABOVE |
| Adult (18-64) | Standard - flag for review | BLOCK_MEDIUM_AND_ABOVE |
| Senior (65+) | Standard - flag for review | BLOCK_MEDIUM_AND_ABOVE |

### AI Safety Configuration

```javascript
// lib/ai-config.js
export const SAFETY_SETTINGS = {
  teen: [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' }
  ],
  adult: [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
  ]
};
```

---

## 6. Code Standards

### Error Handling (MANDATORY)

Every API route must follow this pattern:

```javascript
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    // Validate method
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Validate input
    const { field } = req.body;
    if (!field) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Business logic...
    
    return res.status(200).json({ success: true, data: result });
    
  } catch (error) {
    console.error('API Error:', error);
    
    // Log to audit trail
    await supabaseAdmin.from('audit_logs').insert({
      event_type: 'system',
      action: 'api_error',
      details: { endpoint: req.url, error: error.message },
      severity: 'error'
    }).catch(console.error);
    
    // User-friendly error (NEVER expose internals)
    return res.status(500).json({
      error: 'Something went wrong. Please try again.'
    });
  }
}
```

### Input Validation

Use Zod for all input validation:

```javascript
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  dateOfBirth: z.string().datetime()
});

// In handler
const result = createUserSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ error: result.error.issues });
}
```

### Function Guidelines

- Maximum 50 lines per function
- One function = one responsibility
- Clear verb-based naming: `fetchUserById`, `validateEmail`, `moderateContent`
- JSDoc comments for exported functions

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| API routes | kebab-case | `generate-content.js` |
| React components | PascalCase | `UserProfile.jsx` |
| Utilities | camelCase | `validateInput.js` |

---

## 7. Testing Requirements

### Minimum Coverage

- Unit tests for all utility functions
- Integration tests for API routes (mock AI)
- Error case tests
- **80% coverage for critical paths**

### Pre-Commit Checklist

Before every commit:

- [ ] `npm test` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] No `console.log` in production code
- [ ] Secrets use environment variables
- [ ] Error messages don't leak internals

---

## 8. Performance

### Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| INP (Interaction to Next Paint) | < 200ms |
| CLS (Cumulative Layout Shift) | < 0.1 |

### Optimization Rules

1. **Pagination**: Max 50 items per page
2. **Database Indexes**: Add for frequently queried columns
3. **Caching**: Use appropriate cache headers
4. **Lazy Loading**: Images and non-critical content
5. **Bundle Size**: Monitor and minimize

---

## 9. Deployment

### Vercel Configuration

```json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```

### Git Workflow

1. Create feature branch from `main`
2. Make changes following these standards
3. Run pre-commit checks
4. Create PR with description
5. Merge after review

### Environment Setup

1. **Local**: `.env.local` (not committed)
2. **Vercel**: Dashboard or `vercel env add`

---

## Contacts

| Role | Person | Contact |
|------|--------|---------|
| Incident Commander | Ryan Hutchison | <ryanhutchison@outlook.com.au> |
| Child Safety Officer | Ryan Hutchison | <smalltalkcommunity.backup@gmail.com> |

---

*This document consolidates TECH_STACK_RULES.md and SECURITY_SAFETY_STANDARDS.md.*  
*Previous documents are deprecated and will be removed.*
