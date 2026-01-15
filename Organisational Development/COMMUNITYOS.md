# CommunityOS - Project Status & Implementation Guide

> **Purpose**: Complete reference for AI agents to continue CommunityOS implementation on smalltalk.community.

---

## Project Overview

**CommunityOS** is a multi-tenant platform for community organisations. The first tenant is **smalltalk.community Inc**, a Victorian not-for-profit focused on intergenerational connection in Murrindindi Shire.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (React) |
| Backend | Supabase (Auth, Database, Storage) |
| Hosting | Vercel |
| AI | Google Gemini API (`@google/genai` SDK) |
| External APIs | ABS (demographics), OpenStreetMap (amenities) |

---

## Current Status (15 January 2026)

### ✅ Completed

| Phase | Task | Details |
|-------|------|---------|
| **1** | File renaming | All 20 apps renamed to `CommunityOS - [App].html` |
| **2** | Title tags | Dashboard and apps updated |
| **2** | Header branding | All apps show "CommunityOS" |
| **2** | PWA manifests | Partially complete |

### 🔄 In Progress / Remaining

| Phase | Task | Status |
|-------|------|--------|
| **2** | Update print footers | Not started |
| **2** | Update localStorage keys | Not started |
| **3** | Add app launcher to dashboard | Not started |
| **4** | Create white-label dashboard | Not started |
| **5** | Create Vercel AI API route | Not started |
| **6** | Embed AI into dashboard | Not started |

---

## File Structure

### Current Apps

```
Apps/
├── Draft/                              # 19 apps
│   ├── CommunityOS - Assets Inventory.html
│   ├── CommunityOS - CRM.html
│   ├── CommunityOS - Committee Management.html
│   ├── CommunityOS - Communications Hub.html
│   ├── CommunityOS - Events & Programs.html
│   ├── CommunityOS - Financial Management.html
│   ├── CommunityOS - Fundraising & Development.html
│   ├── CommunityOS - Governance Compliance.html
│   ├── CommunityOS - Impact Reporting Dashboard.html
│   ├── CommunityOS - Learning & Development.html
│   ├── CommunityOS - Lessons & Workshops.html
│   ├── CommunityOS - Meetings & Reporting.html
│   ├── CommunityOS - Partnerships & MOUs.html
│   ├── CommunityOS - Policy Library.html
│   ├── CommunityOS - Project Management.html
│   ├── CommunityOS - Records & Privacy.html
│   ├── CommunityOS - Risk & Compliance.html
│   ├── CommunityOS - Rostering.html
│   └── CommunityOS - Safeguarding Centre.html
└── Final/                              # 1 app (production-ready)
    └── CommunityOS - smalltalk.community Inc Dashboard.html
```

### Target Website Structure

```
smalltalk.community/
├── app/
│   ├── communityos/
│   │   ├── [tenantId]/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── crm/page.tsx
│   │   │   └── ...other apps
│   │   └── layout.tsx
│   └── api/
│       ├── community-insights/route.ts
│       └── auth/[...supabase]/route.ts
├── components/
│   └── communityos/
│       ├── TenantProvider.tsx
│       ├── AppLauncher.tsx
│       ├── CommunityInsightsAI.tsx
│       └── AppShell.tsx
├── lib/
│   ├── supabase/client.ts
│   ├── gemini.ts
│   └── abs-api.ts
└── public/
    └── communityos/apps/  (static HTML apps)
```

---

## Environment Variables

```bash
# Required for Vercel deployment
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-only
GEMINI_API_KEY=AIzaSy...your-key                 # Server-only
```

> [!CAUTION]
> Never commit API keys. Store in Vercel environment variables only. Never prefix secrets with `NEXT_PUBLIC_`.

---

## Implementation Instructions

### Phase 3: App Launcher

Add this panel to the organisation dashboard to launch all 20 apps:

```tsx
// components/communityos/AppLauncher.tsx
const APPS = [
  { id: 'crm', name: 'CRM', icon: '👥', description: 'Member management' },
  { id: 'rostering', name: 'Rostering', icon: '📅', description: 'Volunteer scheduling' },
  { id: 'events', name: 'Events & Programs', icon: '🎉', description: 'Event management' },
  { id: 'financial', name: 'Financial Management', icon: '💰', description: 'Budget tracking' },
  { id: 'governance', name: 'Governance Compliance', icon: '🏛️', description: 'Compliance tools' },
  { id: 'safeguarding', name: 'Safeguarding Centre', icon: '🛡️', description: 'Safety centre' },
  { id: 'assets', name: 'Assets Inventory', icon: '📦', description: 'Asset tracking' },
  { id: 'committee', name: 'Committee Management', icon: '👔', description: 'Board tools' },
  { id: 'communications', name: 'Communications Hub', icon: '📢', description: 'Messaging' },
  { id: 'fundraising', name: 'Fundraising', icon: '💝', description: 'Donor management' },
  { id: 'impact', name: 'Impact Reporting', icon: '📊', description: 'Outcomes tracking' },
  { id: 'learning', name: 'Learning & Development', icon: '📚', description: 'Training' },
  { id: 'lessons', name: 'Lessons & Workshops', icon: '🎓', description: 'Session planning' },
  { id: 'meetings', name: 'Meetings & Reporting', icon: '📝', description: 'Minutes & agendas' },
  { id: 'partnerships', name: 'Partnerships & MOUs', icon: '🤝', description: 'Partner tracking' },
  { id: 'policy', name: 'Policy Library', icon: '📋', description: 'Document repository' },
  { id: 'projects', name: 'Project Management', icon: '📌', description: 'Task management' },
  { id: 'records', name: 'Records & Privacy', icon: '🔒', description: 'Data governance' },
  { id: 'risk', name: 'Risk & Compliance', icon: '⚠️', description: 'Risk register' }
];
```

---

### Phase 4: White-Label Dashboard

Create `CommunityOS - Dashboard.html` as a template that:

- Accepts tenant configuration (name, logo, primary colour)
- Displays the App Launcher grid
- Integrates the Community Insights AI panel
- Uses CSS custom properties for theming

---

### Phase 5: AI Integration (Critical Security)

#### API Route Setup

```typescript
// app/api/community-insights/route.ts
import { GoogleGenerativeAI } from '@google/genai';  // Correct SDK
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `
You are a community insights assistant for CommunityOS, helping local communities in regional Victoria understand their area.

Core Principles:
- Accessible: Explain data in plain language
- Practical: Focus on actionable insights
- Honest: Transparent about data limitations
- Community-centred: Prioritise young people, families, and orgs
- Local context: Consider regional Victorian characteristics

Current Focus: Murrindindi Shire (pilot phase)
Major towns: Alexandra, Eildon, Kinglake, Marysville, Yea

Response format:
1. Direct answer (1-2 sentences)
2. Clear section headings for detail
3. Data source attribution
4. Practical next steps
`;

export async function POST(req: NextRequest) {
  try {
    const { query, location } = await req.json();
    
    // Input validation
    if (!query || typeof query !== 'string' || query.length > 1000) {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }
    
    // Fetch external data
    const [absData, amenities] = await Promise.all([
      fetchABSData(location),
      fetchOSMAmenities(location)
    ]);
    
    const context = `
LOCATION: ${location}
DEMOGRAPHICS: ${JSON.stringify(absData)}
AMENITIES: ${JSON.stringify(amenities)}
    `;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(
      `${SYSTEM_PROMPT}\n\nCONTEXT:\n${context}\n\nUSER QUESTION: ${query}`
    );
    
    return NextResponse.json({ 
      answer: result.response.text(),
      sources: ['ABS Census 2021', 'OpenStreetMap']
    });
  } catch (error) {
    console.error('AI error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' }, 
      { status: 500 }
    );
  }
}
```

> [!IMPORTANT]
> **SDK Requirement**: Use `@google/genai` NOT `@google/generative-ai` (deprecated).

---

### Phase 6: Database Schema (Multi-Tenancy)

```sql
-- Tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,  -- e.g., 'stc' for smalltalk.community
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#003b6f',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant members
CREATE TABLE tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',  -- 'admin', 'board', 'member'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users view their tenants" ON tenants
  FOR SELECT USING (
    id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users view their membership" ON tenant_members
  FOR SELECT USING (user_id = auth.uid());

-- Initial tenant
INSERT INTO tenants (code, name) VALUES ('stc', 'smalltalk.community Inc');
```

---

## Security Checklist

- [ ] RLS enabled on ALL Supabase tables
- [ ] Parameterized queries only (no string concatenation)
- [ ] API keys stored in Vercel environment variables
- [ ] `GEMINI_API_KEY` never prefixed with `NEXT_PUBLIC_`
- [ ] Input validation on all API routes
- [ ] Content sanitised before storage
- [ ] Middleware protects `/communityos/*` routes
- [ ] CORS configured for production domain only

---

## Middleware (Route Protection)

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (req.nextUrl.pathname.startsWith('/communityos')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  return res;
}

export const config = {
  matcher: ['/communityos/:path*']
};
```

---

## Verification Steps

### Functional

- [ ] User login via Supabase Auth
- [ ] Dashboard loads for authenticated users
- [ ] App launcher shows all 20 apps
- [ ] Each app loads correctly
- [ ] AI responds to community queries
- [ ] Data persists per tenant
- [ ] Print functionality works

### Security

- [ ] Unauthenticated users redirected
- [ ] RLS prevents cross-tenant access
- [ ] API keys not in client bundle
- [ ] CORS configured correctly

### Performance

- [ ] Dashboard loads < 3 seconds
- [ ] AI response < 5 seconds
- [ ] Apps function offline (PWA)

### Accessibility

- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation works
- [ ] Touch targets >= 44px

---

## External API References

| API | Documentation | Purpose |
|-----|---------------|---------|
| ABS | [abs.gov.au/apis](https://www.abs.gov.au/about/data-services/application-programming-interfaces-apis) | Demographics |
| OSM Overpass | [overpass-turbo.eu](https://overpass-turbo.eu/) | Amenities |
| Gemini | [ai.google.dev](https://ai.google.dev/) | AI responses |

---

## Language & Style Standards

- **Australian English**: organisation, centre, colour
- **No em dashes**: Use commas instead
- **Tone**: Professional, clear, inclusive
- **Age**: Minimum 13 years (teen 13-17, adult 18-64, senior 65+)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Auth redirect loop | Check middleware matcher config |
| Tenant not loading | Verify RLS policies on tenant_members |
| AI timeout | Increase Vercel function timeout |
| CORS errors | Add API route to allowed origins |
| PWA not installing | Check manifest.json and service worker |

---

## Contact

- **Incident Commander**: Ryan Hutchison
- **Email**: <ryanhutchison@outlook.com.au>
- **Backup**: <smalltalkcommunity.backup@gmail.com>

---

*Document Version: 1.0 | Last Updated: 15 January 2026*
