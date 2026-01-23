# smalltalk.community - AI Agent Rules

> **MANDATORY**: Read this file completely before ANY code changes.

## Quick Reference

| Rule | Value |
|------|-------|
| Minimum Age | 13 years |
| Password Min | 12 characters |
| SDK | `@google/genai` ONLY |
| DB Security | RLS on ALL tables |

---

## STOP - Read Before ANY Action

Before writing code, you **MUST** read:

- **[DEVELOPMENT_STANDARDS.md](../DEVELOPMENT_STANDARDS.md)** - Complete technical and security standards
- **[INCIDENT_RESPONSE.md](../INCIDENT_RESPONSE.md)** - Incident severity levels and response procedures

---

## Critical Non-Negotiable Rules

### 1. User Age Requirements

- **Minimum age**: 13 years old
- **Age groups**: Teen (13-17), Adult (18-64), Senior (65+)
- **NO** parental consent system (removed)
- **NO** `child` age group

### 2. SDK Requirements

```javascript
// ✅ CORRECT
import { GoogleGenerativeAI } from '@google/genai';

// ❌ WRONG - DEPRECATED
import { GoogleGenerativeAI } from '@google/generative-ai';
```

### 3. Database Security

- RLS enabled on ALL tables
- Parameterized queries ONLY (never string concatenation)
- Client code: Use `anon` key with RLS
- Server code: Use `service` key (NEVER expose to client)

### 4. Environment Variables

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

### 5. Input Validation

- ALL inputs validated with Zod schemas
- ALL user content sanitized before storage
- ALL API routes have try/catch error handling

### 6. Content Moderation

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

## Response Format

When implementing features, structure your response as:

1. **What I'm implementing**: [brief description]
2. **Standards checked**: [sections from DEVELOPMENT_STANDARDS.md]
3. **Implementation**: [code]
4. **Compliance notes**: [how this meets standards]

---

## Contacts

- **Incident Commander**: Ryan Hutchison
- **Child Safety Officer**: Ryan Hutchison  
- **Email**: <ryanhutchison@outlook.com.au>
- **Backup**: `<ADMIN_TEST_EMAIL>`

---

*Document Version: 1.0 | Created: 2 January 2026*
