# AGENTS.md - AI Agent Documentation

**Project:** smalltalk.community
**Type:** Multi-Age Community Platform
**Last Updated:** 18 January 2026

> **⚠️ MANDATORY**: Read [DEVELOPMENT_STANDARDS.md](./DEVELOPMENT_STANDARDS.md) before ANY code changes.

This file provides context for AI agents working on the smalltalk.community codebase. For detailed rules and standards, see DEVELOPMENT_STANDARDS.md.

---

## Project Overview

### What is smalltalk.community?

smalltalk.community is a safe, inclusive online platform that connects people of all ages through community groups, AI-powered conversations, and local events. The platform serves:

- **Teenagers** (13-17) - minimum age requirement
- **Adults** (18-64)
- **Seniors** (65+)
- **Organisations** (councils, community groups, businesses)

Because users aged 13-17 use the platform, all features must comply with Victorian Child Safe Standards and Australian privacy laws.

### Core Features

1. **Community Groups** - Age-appropriate groups for interests, locations, and activities
2. **AI Conversations** - Safe AI-powered chat with content moderation
3. **Events** - Community events and activities
4. **Resources** - Helpful information and support services
5. **Content Moderation** - Multi-layered filtering to protect all users

---

## Technical Architecture

### Stack Overview

- **Frontend:** Next.js 14 with React, deployed on Vercel
- **Backend:** Vercel Serverless Functions (no Express/Fastify)
- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth
- **AI:** Google Generative AI (Gemini 2.0 Flash)
- **Version Control:** GitHub with automatic Vercel deployments

### Directory Structure

```
smalltalk.community/
├── app/                        # Next.js app directory
├── api/                        # Vercel Serverless Functions
│   ├── ai/                     # AI generation and moderation
│   ├── auth/                   # Authentication endpoints
│   ├── content/                # Content CRUD operations
│   ├── reports/                # Content reporting
│   └── users/                  # User management
├── lib/                        # Shared utilities
│   ├── supabase.js            # Database client
│   ├── ai-config.js           # AI model configuration
│   ├── validation.js          # Input validation
│   └── rate-limiter.js        # Rate limiting
├── components/                # React components
│   ├── ui/                    # Shadcn UI components
│   └── platform/              # Platform-wide components
├── hooks/                      # Custom React hooks
├── migrations/                 # Database migrations
├── tests/                      # Test files
└── docs/                       # Documentation

**Critical files to read before coding:**
- .agent/rules.md (or CLAUDE.md)
- DEVELOPMENT_STANDARDS.md
- INCIDENT_RESPONSE.md
```

---

## Critical Rules

### MANDATORY: Read Before Any Code Changes

1. **Security First**
   - All user inputs MUST be validated and sanitised
   - All database queries MUST use parameterized queries
   - All content MUST pass moderation before visibility
   - Minimum age is 13 years (no parental consent system)
   - Personal information MUST be filtered from user content

2. **SDK Requirements**
   - Use `@google/genai` SDK only (NOT `@google/generative-ai`)
   - Use `@supabase/supabase-js` for database operations
   - NEVER use deprecated Google AI SDKs

3. **Database Security**
   - Enable Row Level Security (RLS) on all new tables
   - Use `supabase` client (anon key) for client-side code
   - Use `supabaseAdmin` client (service key) for server-side code only
   - NEVER expose service key in client code
   - Add indexes for frequently queried columns

4. **API Functions**
   - All Vercel Functions MUST have try/catch error handling
   - All errors MUST be logged to audit_logs table
   - User-facing errors MUST be friendly (hide technical details)
   - CORS headers required for browser requests
   - Maximum function duration: 60 seconds

5. **Content Moderation**
   - All user-generated content passes through moderation
   - Child content requires pre-approval
   - Three-layer filtering: keywords, PII detection, AI safety
   - Age-appropriate content restrictions enforced at database level

---

## Key Files and Their Purposes

### Security and Technical Standards

**DEVELOPMENT_STANDARDS.md** (Primary Reference)

- Victorian Child Safe Standards compliance requirements
- Required SDK versions and imports (`@google/genai`)
- Vercel Serverless Functions structure
- Supabase client configuration and RLS policies
- Multi-layered content moderation system
- Authentication and session security
- Rate limiting implementation
- Input validation and sanitisation
- Error handling patterns
- Code style and naming conventions

**Key takeaways:**

- Minimum age is 13 years (no parental consent system)
- Content moderation has three layers: keywords, PII, AI safety
- Use `@google/genai` SDK only (NOT `@google/generative-ai`)
- Vercel Functions are stateless, no Express needed
- Supabase RLS enforces authorization at database level
- All async operations use async/await (no callbacks)
- All security events logged to audit_logs table

### Database Schema

The platform uses PostgreSQL through Supabase with these core tables:

**users**

- Stores user accounts with age verification
- Fields: id, email, username, account_type, date_of_birth, age_group
- Special fields for children: parent_email, parent_consent_verified

**content**

- User-generated content with moderation status
- Fields: id, user_id, title, body, content_type, moderation_status
- Visibility controls: visibility, age_restriction, is_visible

**community_groups**

- Community groups with age restrictions
- Fields: id, name, group_type, age_restriction, member_count

**reports**

- Content reports with priority-based handling
- Fields: id, reporter_id, content_id, report_type, priority, status

**audit_logs**

- Complete audit trail for compliance
- Fields: id, event_type, action, user_id, details, severity

**All tables have RLS enabled** - policies in DEVELOPMENT_STANDARDS.md

---

## Common Tasks and How to Do Them

### Adding a New API Endpoint

1. Create file in `api/` directory (e.g., `api/content/create.js`)
2. Follow this template:

```javascript
// api/content/create.js
import { supabaseAdmin } from '../../lib/supabase';
import { validateInput } from '../../lib/validation';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Validate inputs
    const { userId, content } = req.body;
    
    // Your logic here
    
    // Log to audit trail
    await supabaseAdmin.from('audit_logs').insert({
      event_type: 'user_action',
      action: 'your_action',
      user_id: userId,
      severity: 'info'
    });
    
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Operation failed. Please try again.' 
    });
  }
}
```

1. Add input validation in `lib/validation.js` if needed
2. Write tests in `tests/api/`
3. Update RLS policies if touching database

### Adding a Database Table

1. Create migration SQL in `migrations/`
2. Define table schema with constraints
3. Enable RLS: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
4. Create RLS policies for SELECT, INSERT, UPDATE, DELETE
5. Add indexes for frequently queried columns
6. Test policies with different user roles
7. Document schema in DEVELOPMENT_STANDARDS.md

### Implementing Content Moderation

All content must pass through moderation pipeline:

1. **Keyword Check** - Filter blocked words
2. **PII Detection** - Remove phone numbers, addresses, emails
3. **AI Safety Check** - Context-aware moderation using Gemini
4. **Age Restriction** - Apply appropriate visibility rules

Use the existing moderation API (`api/moderation/moderate-content.js`) or follow its pattern.

### Adding Age-Appropriate Features

When building features that differ by age:

1. Fetch user's age_group from users table
2. Apply appropriate restrictions:
   - `child`: Most restrictive, pre-approval required
   - `teen`: Moderate restrictions
   - `adult/senior`: Standard restrictions
3. Use RLS policies to enforce at database level
4. Document age restrictions in feature documentation

---

## AI Model Configuration

### Safety Settings by Age Group

The platform uses different AI safety thresholds based on content visibility:

- **All Ages / Children**: BLOCK_LOW_AND_ABOVE for all categories
- **Teens and Up**: BLOCK_LOW_AND_ABOVE for most, BLOCK_MEDIUM_AND_ABOVE for dangerous content
- **Adults Only**: BLOCK_MEDIUM_AND_ABOVE for all categories

Configuration in `lib/ai-config.js`:

```javascript
import { GoogleGenerativeAI } from '@google/genai';

export function getAIModel(visibility = 'public') {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.7
    },
    safetySettings: getSafetySettings(visibility)
  });
}
```

ALWAYS use `getAIModel()` function, NEVER initialize AI client directly.

---

## Testing Guidelines

### Required Tests

1. **Unit Tests** - All utility functions
2. **Integration Tests** - API endpoints with mocked dependencies
3. **Error Tests** - Handle failures gracefully
4. **Security Tests** - Validate RLS policies work correctly

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test.js

# Run with coverage
npm test -- --coverage
```

### Mock Configuration

Mock external services in tests:

```javascript
// Mock Google AI
jest.mock('@google/genai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => 'Mocked response' }
      })
    })
  }))
}));

// Mock Supabase
jest.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: {}, error: null })
      })
    })
  }
}));
```

---

## Code Style Guidelines

### Naming Conventions

- **API Routes**: kebab-case (`generate-content.js`)
- **React Components**: PascalCase (`UserProfile.jsx`)
- **Utilities**: camelCase (`validateInput.js`)
- **Database Tables**: snake_case (`community_groups`)
- **Functions**: Descriptive verbs (`fetchUserData`, `validateEmail`)

### Code Patterns

**Good:**

```javascript
// Clear, descriptive names
async function fetchUserContentByAge(userId, ageGroup) {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to fetch content:', error);
    throw error;
  }
}
```

**Bad:**

```javascript
// Generic names, no error handling
function getData(id) {
  return supabase.from('content').select('*').eq('user_id', id);
}
```

### Error Handling Rules

1. Every async function has try/catch
2. Log errors with context
3. Return user-friendly error messages
4. Log security events to audit_logs
5. Never expose internal errors to users

---

## Environment Variables

Required environment variables (stored in Vercel):

```bash
# Google AI
GOOGLE_API_KEY=your_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# App Config
NEXT_PUBLIC_APP_URL=https://smalltalk.community
NODE_ENV=production
```

Client-side code can only access `NEXT_PUBLIC_*` variables. Service keys MUST only be used in server-side code.

---

## Deployment Process

### Automatic Deployments

- **Push to main** → Production deployment on Vercel
- **Pull request** → Preview deployment with unique URL
- **Push to feature branch** → Preview deployment

### Pre-Deployment Checklist

1. All tests passing (`npm test`)
2. No console errors or warnings
3. Database migrations applied to Supabase
4. Environment variables configured in Vercel
5. RLS policies tested and working
6. Security review completed

### Rollback Process

If a deployment causes issues:

1. Revert commit in GitHub
2. Vercel automatically redeploys previous version
3. Investigate issue in local environment
4. Fix and redeploy

---

## Common Mistakes to Avoid

### Security Mistakes

- ❌ Using service key in client-side code
- ❌ Not validating user inputs
- ❌ Exposing error details to users
- ❌ Missing RLS policies on tables
- ❌ Not logging security events

### Technical Mistakes

- ❌ Using old Google AI SDK (`@google/generative-ai`)
- ❌ Adding Express/Fastify to Vercel Functions
- ❌ Not handling CORS in API functions
- ❌ Making API calls in loops (use bulk operations)
- ❌ Forgetting database indexes

### Code Quality Mistakes

- ❌ Functions longer than 50 lines
- ❌ Generic function names (`handleData`, `processStuff`)
- ❌ Missing error handling
- ❌ No JSDoc comments on exported functions
- ❌ Using callbacks instead of async/await

---

## When Working with Jules

### Before Starting Work

1. Read DEVELOPMENT_STANDARDS.md
2. Read CLAUDE.md for quick reference
3. Review relevant code files
4. Check for existing similar implementations
5. Verify all dependencies are current versions

### During Development

1. Ask clarifying questions if requirements are unclear
2. Break large tasks into smaller, testable pieces
3. Write tests alongside implementation
4. Test locally before committing
5. Check that changes don't break existing features

### Before Submitting Code

1. Run all tests and ensure they pass
2. Verify no security violations
3. Check code follows style guidelines
4. Ensure proper error handling
5. Update documentation if behaviour changes

### If You Get Stuck

1. Check official documentation (Vercel, Supabase, Google AI)
2. Review similar existing code in the project
3. Verify file paths and imports are correct
4. Ask for clarification rather than making assumptions
5. If the same error occurs twice, stop and report the issue

---

## Additional Resources

### Project Documentation

- **README.md** - Project setup and overview
- **DEVELOPMENT_STANDARDS.md** - Complete security and technical standards
- **CLAUDE.md** - Quick reference for AI agents
- **INCIDENT_RESPONSE.md** - Incident severity and procedures
- **SECURITY.md** - Vulnerability reporting policy

### External Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Functions Documentation](https://vercel.com/docs/functions)
- [Supabase Documentation](https://supabase.com/docs)
- [Google AI SDK Documentation](https://ai.google.dev/gemini-api/docs)

### Getting Help

- Review existing code patterns in the project
- Check GitHub issues for known problems
- Test in local development environment first
- Ask specific questions with context

---

## Summary for AI Agents

**What this project is:**
A multi-age community platform with strict safety requirements for protecting children while serving all age groups.

**Most important rules:**

1. Child safety compliance is mandatory (Victorian Child Safe Standards)
2. All content must be moderated before visibility
3. Use correct SDK versions (`@google/genai` for AI)
4. Database security via Row Level Security (RLS)
5. Comprehensive error handling and audit logging

**Before any code changes:**

- Read DEVELOPMENT_STANDARDS.md
- Read CLAUDE.md for quick reference
- Review relevant existing code
- Verify file paths and dependencies

**Common patterns:**

- Vercel Serverless Functions for API endpoints
- Supabase for database with RLS
- Three-layer content moderation (keywords, PII, AI)
- Age-based content filtering
- Audit logging for all security events

**If unsure:**

- Ask for clarification
- Check existing similar implementations
- Review official documentation
- Don't make assumptions about security requirements

---

**Last Updated:** 18 January 2026
**Maintained by:** Ryan Hutchison
**Contact:** via GitHub issues in this repository
