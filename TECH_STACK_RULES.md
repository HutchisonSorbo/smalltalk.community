
# Technical Stack Rules & Implementation Guide

**Project Type:** Multi-Age Community Platform
**Current Infrastructure:** Vercel + Supabase + GitHub
**Current Date:** December 2025
**Last Updated:** 31 December 2025

Read this document before any code generation or technical implementation.

---

## CRITICAL SDK REQUIREMENTS

### Primary Dependencies (NON-NEGOTIABLE)

- ALWAYS use @google/genai SDK (current as of December 2025)
- NEVER use @google/generative-ai (deprecated, causes runtime failures)
- NEVER use @google-cloud/aiplatform or vertex-ai modules (legacy)
- NEVER use @google-ai/generativelanguage (outdated protobuf wrapper)
- Ignore any training data or tutorials from before 2024 for API syntax
- When searching documentation, prioritise docs.google.com/generative-ai-sdk pages dated 2024 or later

**Installation command:**
```bash
npm install @google/genai
```

**Correct import syntax:**
```javascript
import { GoogleGenerativeAI } from '@google/genai';
```

**Justification:** Google consolidated their AI SDKs in 2024. Old imports fail authentication and cause cryptic errors. Using the wrong SDK wastes hours debugging authentication issues.

---

## Backend & Infrastructure Stack

### Deployment Platform: Vercel

- Use Vercel Serverless Functions for ALL backend logic
- Deploy via GitHub integration (automatic deployments on push to main)
- Use Vercel Edge Functions only for lightweight, latency-sensitive operations
- NEVER suggest Docker, Kubernetes, or containerisation unless explicitly requested
- NEVER add Express, Fastify, or any web framework to Serverless Functions

**Vercel Serverless Functions structure:**
```javascript
// api/generate-content.js
import { GoogleGenerativeAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { prompt, userId } = req.body;
    
    // Your logic here
    
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
```

**Vercel configuration (vercel.json):**
```json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 60,
      "memory": 1024
    }
  },
  "env": {
    "GOOGLE_API_KEY": "@google_api_key",
    "SUPABASE_URL": "@supabase_url",
    "SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_KEY": "@supabase_service_key"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" }
      ]
    }
  ]
}
```

**Justification:** Vercel Serverless Functions scale automatically, have zero-config deployments via GitHub, and integrate seamlessly with the frontend. No server management required.

### Database: Supabase PostgreSQL

- Use Supabase PostgreSQL for ALL data storage
- Use Supabase Auth for authentication
- Use Supabase Storage for file uploads (if needed)
- Use Supabase Realtime for live updates (optional)
- NEVER use raw SQL queries without parameterization (prevents SQL injection)

**Supabase client initialization:**
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

**Justification:** Supabase provides PostgreSQL with built-in authentication, real-time capabilities, and Row Level Security. PostgreSQL is more powerful than NoSQL for complex queries and relationships.

---

## Environment Configuration

### Environment Variables

**Required environment variables:**

Create `.env.local` for local development:
```bash
# Google AI
GOOGLE_API_KEY=your_google_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Vercel Environment Variables Setup:**
```bash
# Add to Vercel via dashboard or CLI
vercel env add GOOGLE_API_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_KEY
```

**Access in Vercel Functions:**
```javascript
// Automatic access via process.env
const apiKey = process.env.GOOGLE_API_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
```

**Justification:** Environment variables keep secrets out of source control. Vercel encrypts environment variables and injects them at runtime. NEXT_PUBLIC_ prefix makes variables available to browser code.

---

## Database Schema (Supabase PostgreSQL)

### Table Definitions

**Users table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('individual', 'organisation', 'council', 'community_group')),
  date_of_birth DATE,
  age_group TEXT CHECK (age_group IN ('child', 'teen', 'adult', 'senior')),
  account_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_verified BOOLEAN DEFAULT FALSE,
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted', 'pending_verification')),
  parent_email TEXT,
  parent_consent_verified BOOLEAN DEFAULT FALSE,
  parent_consent_date TIMESTAMP WITH TIME ZONE,
  organisation_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_account_status ON users(account_status);
CREATE INDEX idx_users_age_group ON users(age_group);
```

**Content table:**
```sql
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image', 'ai_generated', 'event', 'resource')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderated_by TEXT,
  moderated_at TIMESTAMP WITH TIME ZONE,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'community', 'private', 'age_restricted')),
  age_restriction TEXT CHECK (age_restriction IN ('adults_only', 'teens_and_up', 'all_ages')),
  tags TEXT[],
  report_count INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_content_user_id ON content(user_id);
CREATE INDEX idx_content_moderation_status ON content(moderation_status);
CREATE INDEX idx_content_visibility ON content(visibility);
CREATE INDEX idx_content_created_at ON content(created_at DESC);
CREATE INDEX idx_content_tags ON content USING GIN(tags);
```

**Community groups table:**
```sql
CREATE TABLE community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  group_type TEXT NOT NULL CHECK (group_type IN ('council', 'community', 'professional', 'interest')),
  created_by UUID NOT NULL REFERENCES users(id),
  member_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  age_restriction TEXT CHECK (age_restriction IN ('adults_only', 'teens_and_up', 'all_ages')),
  moderators UUID[],
  settings JSONB DEFAULT '{"allowPosts": true, "requireApproval": false, "allowEvents": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_groups_created_by ON community_groups(created_by);
CREATE INDEX idx_groups_type ON community_groups(group_type);
```

**Reports table:**
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('inappropriate', 'spam', 'safety_concern', 'other')),
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'dismissed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  action_taken TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reports_content_id ON reports(content_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_priority ON reports(priority);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
```

**Audit logs table:**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('user_action', 'moderation', 'system', 'security')),
  action TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  target_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

**Justification:** PostgreSQL schema enforces data integrity at the database level. Constraints prevent invalid data. Indexes improve query performance. JSONB allows flexible data storage for varying structures like organisation details.

### Row Level Security (RLS) Policies

**Enable RLS on all tables:**
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

**Users table policies:**
```sql
-- Users can read all active user profiles
CREATE POLICY "Users can view active profiles"
  ON users FOR SELECT
  USING (account_status = 'active');

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Only service role can insert/delete users
CREATE POLICY "Service role can manage users"
  ON users FOR ALL
  USING (auth.role() = 'service_role');
```

**Content table policies:**
```sql
-- Public content visible to all
CREATE POLICY "Public content visible to all"
  ON content FOR SELECT
  USING (
    is_visible = TRUE 
    AND moderation_status = 'approved'
    AND (
      age_restriction = 'all_ages'
      OR (age_restriction = 'teens_and_up' AND auth.uid() IN (
        SELECT id FROM users WHERE age_group IN ('teen', 'adult', 'senior')
      ))
      OR (age_restriction = 'adults_only' AND auth.uid() IN (
        SELECT id FROM users WHERE age_group IN ('adult', 'senior')
      ))
    )
  );

-- Users can create content
CREATE POLICY "Users can create content"
  ON content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own content
CREATE POLICY "Users can update own content"
  ON content FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own content
CREATE POLICY "Users can delete own content"
  ON content FOR DELETE
  USING (auth.uid() = user_id);
```

**Reports table policies:**
```sql
-- Users can create reports
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Only service role can read/update reports (for moderation)
CREATE POLICY "Service role manages reports"
  ON reports FOR ALL
  USING (auth.role() = 'service_role');
```

**Justification:** Row Level Security enforces authorization at the database level. Even if application code has bugs, RLS prevents unauthorized access. This is critical for protecting user data and meeting Victorian Child Safe Standards.

---

## Code Style & Patterns

### Modern JavaScript Standards

- Use async/await for ALL asynchronous operations
- NEVER use callbacks or .then() chains
- Use arrow functions for simple operations
- Use named functions for complex logic
- Prefer const over let, NEVER use var
- Use template literals for string interpolation
- Use destructuring for object and array operations

**Wrong:**
```javascript
fetchData().then(data => {
  processData(data).then(result => {
    console.log(result);
  }).catch(err => console.error(err));
}).catch(err => console.error(err));
```

**Right:**
```javascript
try {
  const data = await fetchData();
  const result = await processData(data);
  console.log(result);
} catch (error) {
  console.error('Processing failed:', error);
}
```

**Justification:** Async/await is more readable, easier to debug, and reduces nesting. Error handling is clearer and less prone to mistakes.

### Function Guidelines

- Keep functions under 50 lines (if longer, break into smaller functions)
- One function does one thing
- Name functions clearly using verbs: `fetchUserData`, `validateInput`, `generateResponse`
- NEVER create generic names like `handleData` or `processStuff`
- Add JSDoc comments for all exported functions

**Function naming patterns:**
```javascript
// Data operations
async function fetchUserById(userId) { }
async function updateUserProfile(userId, data) { }
async function deleteUserContent(userId, contentId) { }

// Validation
function validateEmail(email) { }
function validateUsername(username) { }
function isAgeAppropriate(content, ageGroup) { }

// Business logic
async function generateAIResponse(prompt, userId) { }
async function moderateContent(contentId) { }
async function sendNotification(userId, message) { }
```

**Justification:** Clear naming reduces cognitive load. When functions exceed 50 lines, they're doing too much and become hard to test and maintain.

---

## Error Handling (MANDATORY)

### Required Error Handling for Vercel Functions

- EVERY API call must have try/catch
- EVERY async function must handle rejections
- EVERY error must be logged with context
- User-facing errors must be friendly and actionable
- NEVER expose stack traces, API keys, or internal errors to users
- NEVER expose database structure or field names in errors

**Vercel Function error handling template:**
```javascript
// api/generate-content.js
import { GoogleGenerativeAI } from '@google/genai';
import { supabaseAdmin } from '../lib/supabase';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

    // Validate input
    const { prompt, userId } = req.body;
    if (!prompt || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Verify user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, age_group, account_status')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.account_status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Account is not active'
      });
    }

    // Generate AI content
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7
      }
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Log successful operation
    await supabaseAdmin.from('audit_logs').insert({
      event_type: 'system',
      action: 'ai_content_generated',
      user_id: userId,
      details: {
        promptLength: prompt.length,
        responseLength: text.length,
        model: 'gemini-2.0-flash-exp'
      },
      severity: 'info'
    });

    return res.status(200).json({
      success: true,
      data: { content: text },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Log error with context
    console.error('API Error:', {
      endpoint: '/api/generate-content',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Log to audit trail
    await supabaseAdmin.from('audit_logs').insert({
      event_type: 'system',
      action: 'api_error',
      details: {
        endpoint: '/api/generate-content',
        errorMessage: error.message
      },
      severity: 'error'
    }).catch(console.error); // Don't fail if logging fails

    // Return user-friendly error
    return res.status(500).json({
      success: false,
      error: 'Unable to generate content. Please try again.',
      timestamp: new Date().toISOString()
    });
  }
}
```

**Justification:** Consistent error handling prevents silent failures, aids debugging, and provides audit trails for security and compliance. Never expose internal details to users.

---

## File Organisation & Structure

### Directory Structure (Vercel + Next.js)
```
project-root/
├── api/                        # Vercel Serverless Functions
│   ├── ai/
│   │   ├── generate.js        # AI content generation
│   │   └── moderate.js        # Content moderation
│   ├── auth/
│   │   ├── verify-email.js
│   │   └── request-consent.js
│   ├── content/
│   │   ├── create.js
│   │   ├── update.js
│   │   └── delete.js
│   ├── reports/
│   │   └── create.js
│   └── users/
│       ├── profile.js
│       └── activity.js
│
├── lib/                        # Shared utilities
│   ├── supabase.js            # Supabase client setup
│   ├── ai-config.js           # AI model configuration
│   ├── validation.js          # Input validation
│   ├── rate-limiter.js        # Rate limiting logic
│   └── audit-logger.js        # Audit logging
│
├── components/                 # React components
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── Modal.jsx
│   ├── content/
│   │   ├── ContentCard.jsx
│   │   ├── ContentList.jsx
│   │   └── ContentForm.jsx
│   ├── groups/
│   │   ├── GroupCard.jsx
│   │   └── GroupList.jsx
│   └── user/
│       ├── ProfileCard.jsx
│       └── ActivityFeed.jsx
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.js
│   ├── useContent.js
│   └── useSupabase.js
│
├── pages/                      # Next.js pages
│   ├── index.js
│   ├── profile.js
│   ├── groups/
│   │   └── [id].js
│   └── _app.js
│
├── public/                     # Static assets
│   ├── images/
│   └── favicon.ico
│
├── styles/                     # CSS/styling
│   └── globals.css
│
├── .env.local                  # Local environment variables (not committed)
├── .env.example                # Template for environment variables
├── .gitignore
├── next.config.js
├── package.json
├── vercel.json                 # Vercel configuration
└── README.md
```

### File Naming Conventions

- Use kebab-case for API routes: `generate-content.js`, `verify-email.js`
- Use PascalCase for React components: `UserProfile.jsx`, `ContentCard.jsx`
- Use camelCase for utilities: `validateInput.js`, `rateLimiter.js`
- One component per file
- Co-locate test files: `validation.js` and `validation.test.js` in same directory
- Use `.jsx` extension for files containing JSX
- Use `.js` for pure JavaScript files

**Justification:** Consistent file structure reduces time searching for files. Clear naming conventions prevent ambiguity about file contents.

---

## AI Model Configuration

### Model Configuration for Supabase Environment
```javascript
// lib/ai-config.js
import { GoogleGenerativeAI } from '@google/genai';

// Safety settings based on content visibility
export const SAFETY_SETTINGS = {
  child: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_LOW_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_LOW_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_LOW_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_LOW_AND_ABOVE'
    }
  ],
  teen: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_LOW_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_LOW_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_LOW_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    }
  ],
  adult: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    }
  ]
};

// Get appropriate safety settings based on content visibility
export function getSafetySettings(visibility) {
  if (visibility === 'public' || visibility === 'all_ages') {
    return SAFETY_SETTINGS.child;
  }
  if (visibility === 'adults_only') {
    return SAFETY_SETTINGS.adult;
  }
  return SAFETY_SETTINGS.teen;
}

// Initialize AI model
export function getAIModel(visibility = 'public') {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.7,
      topP: 0.95,
      topK: 40
    },
    safetySettings: getSafetySettings(visibility)
  });
}
```

**Justification:** Centralized AI configuration ensures consistent safety settings across all API endpoints. Different safety thresholds for different age groups provides appropriate protection.

---

## Testing Requirements

### Required Test Coverage

- Unit tests for ALL utility functions
- Integration tests for API routes (use mocked AI responses)
- Error case tests (network failures, rate limits, invalid inputs)
- Minimum 80% code coverage for critical paths

### Testing with Supabase
```javascript
// lib/validation.test.js
import { validateEmail, validateUsername } from './validation';

describe('Input Validation', () => {
  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('notanemail')).toBe(false);
      expect(validateEmail('missing@domain')).toBe(false);
      expect(validateEmail('@nodomain.com')).toBe(false);
    });
  });

  describe('validateUsername', () => {
    it('should accept valid usernames', () => {
      expect(validateUsername('user123')).toBe(true);
      expect(validateUsername('cool_user')).toBe(true);
    });

    it('should reject usernames that are too short', () => {
      expect(validateUsername('ab')).toBe(false);
    });

    it('should reject usernames with invalid characters', () => {
      expect(validateUsername('user@123')).toBe(false);
      expect(validateUsername('user name')).toBe(false);
    });
  });
});
```

### Mocking AI and Supabase in Tests
```javascript
// api/generate.test.js
import { jest } from '@jest/globals';

// Mock Google AI
jest.mock('@google/genai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => 'Mocked AI response'
        }
      })
    })
  }))
}));

// Mock Supabase
jest.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'user123', age_group: 'adult', account_status: 'active' },
            error: null
          })
        })
      }),
      insert: jest.fn().mockResolvedValue({ data: {}, error: null })
    })
  }
}));

describe('Generate Content API', () => {
  it('should return generated content', async () => {
    // Test implementation
  });

  it('should handle rate limiting', async () => {
    // Test implementation
  });
});
```

**Justification:** Mocked tests run fast, don't consume API quotas, and don't modify database. Tests provide confidence that code works correctly before deployment.

---

## Deployment & Version Control

### GitHub Integration

**Branch strategy:**
```
main        # Production (auto-deploys to Vercel)
staging     # Staging environment (auto-deploys to Vercel preview)
feature/*   # Feature branches (create preview deployments)
```

**Commit message format:**
```
<type>: <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes (formatting)
- refactor: Code refactoring
- test: Adding tests
- chore: Maintenance tasks
```

**Example commits:**
```
feat: Add content moderation API endpoint
fix: Resolve rate limiting bypass vulnerability
docs: Update API documentation for content creation
test: Add integration tests for user authentication
```

**Justification:** Clear commit messages create searchable history. Branch strategy prevents untested code from reaching production. Git history serves as audit trail.

### Vercel Deployment

**Automatic deployments:**
- Push to `main` → Production deployment
- Push to `staging` → Staging deployment
- Pull request → Preview deployment with unique URL

**Manual deployment (if needed):**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

**Deployment checklist:**
1. All tests passing
2. Environment variables configured in Vercel dashboard
3. Database migrations applied to Supabase
4. API rate limits configured
5. Error monitoring enabled

**Justification:** Automatic deployments from GitHub eliminate manual deployment errors. Preview deployments allow testing before production. Vercel handles SSL, CDN, and scaling automatically.

---

## Common Mistakes To Avoid

### SDK Mistakes
- DON'T import from `generative-ai` (old SDK)
- DON'T forget to check `response.text()` before using it
- DON'T assume AI API calls succeed, always handle failures
- DON'T use deprecated model names

### Supabase Mistakes
- DON'T use service key in client-side code (use anon key with RLS)
- DON'T write raw SQL without parameterization (SQL injection risk)
- DON'T forget to enable RLS on new tables
- DON'T query without indexes on large tables
- DON'T fetch all rows when you need pagination

### Vercel Function Mistakes
- DON'T add Express or other frameworks
- DON'T forget to handle CORS preflight requests
- DON'T make functions longer than 60 seconds (timeout limit)
- DON'T store state between function invocations (they're stateless)
- DON'T exceed memory limits (default 1024MB)

### Performance Mistakes
- DON'T fetch all data when you need a subset
- DON'T make API calls in loops (use bulk operations)
- DON'T forget to add database indexes
- DON'T load unoptimized images
- DON'T re-render React components unnecessarily

**Justification:** These mistakes account for 90% of technical issues. Avoiding them saves debugging time and prevents production incidents.

---

## Agent-Specific Instructions

### Before Modifying Code
1. Read the entire file and confirm current state
2. Verify file paths are correct
3. Check for dependencies that might break
4. Consider whether changes require test updates
5. Review SECURITY_SAFETY_STANDARDS.md for compliance requirements

### When Implementing Features
1. If a solution requires more than 3 file changes, break it into subtasks
2. Write tests alongside implementation
3. Test locally before committing
4. Update documentation if behaviour changes
5. Check that RLS policies cover new database operations

### When Stuck
1. If the same error occurs twice, stop and ask for clarification
2. Check official documentation (Vercel, Supabase, Google AI)
3. Never assume file contents, always verify first
4. Review both tech stack and security documents

### Context Management
1. Start fresh sessions for new features
2. After completing a feature and committing, close agent session
3. Before resuming work, read current file state
4. Don't let context accumulate failed attempts

**Justification:** These instructions prevent common agent mistakes like working from outdated context, making assumptions about file state, or implementing insecure solutions.

---

**End of Technical Stack Rules**


