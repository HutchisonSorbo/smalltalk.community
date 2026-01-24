# Smalltalk.Community Admin Guide

> Comprehensive guide for new administrators covering the website structure, Payload CMS, CommunityOS, and offline-first sync.

---

## Table of Contents

1. [Website Structure Overview](#website-structure-overview)
2. [Admin Panel](#admin-panel)
3. [Payload CMS](#payload-cms)
4. [CommunityOS](#communityos)
5. [PWA & Offline-First Sync (Ditto)](#pwa--offline-first-sync-ditto)
6. [Available Apps](#available-apps)

---

## Website Structure Overview

The platform is built with **Next.js 15** using the App Router architecture:

```
app/
├── (payload)/          # Payload CMS API endpoints
├── admin/              # Platform admin panel
├── apps/               # User app selection
├── communityos/        # Multi-tenant CommunityOS apps
├── dashboard/          # User dashboard
├── local-music-network/# Local Music Network app
├── onboarding/         # User onboarding flow
├── peer-support-finder/# Peer Support Finder app
├── volunteer-passport/ # Volunteer Passport app
├── work-experience-hub/# Work Experience Hub
└── youth-service-navigator/ # Youth Service Navigator
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `app/admin/` | Platform administration interface |
| `app/communityos/` | Multi-tenant organization tools |
| `components/` | Shared React components |
| `lib/` | Utility functions and configs |
| `server/` | Database and server utilities |
| `shared/` | Database schema definitions |

---

## Admin Panel

Access the admin panel at `/admin`. The admin panel provides:

### Dashboard (`/admin`)

- **Key Metrics**: Total users, active users, new registrations
- **User Growth Chart**: Visual representation of user growth over time
- **Recent Activity**: Latest platform activity
- **Recent Users**: Newly registered users

### Available Sections

| Section | Path | Description |
|---------|------|-------------|
| **Users & Access** | `/admin/users` | Manage platform users, roles, bulk operations |
| **Content** | `/admin/content` | Manage CMS pages and media |
| **Announcements** | `/admin/announcements` | Create and manage platform announcements |
| **Communications** | `/admin/communications` | Email templates and message history |
| **Security** | `/admin/security` | Audit logs, IP allowlists, failed logins |
| **Settings** | `/admin/settings` | Feature flags and platform configuration |
| **Apps** | `/admin/apps` | Manage and test platform applications |
| **Testing** | `/admin/testing` | Generate test data for development |

### User Management (`/admin/users`)

- View and search all platform users
- Edit individual user profiles
- Bulk operations: suspend, reactivate, export
- Role management

---

## Payload CMS

Payload CMS 3.0 is integrated for content management. The admin UI is disabled in favor of the custom admin panel.

### Configuration

Located in [`payload.config.ts`](file:///home/ryan/Documents/Projects/smalltalk.community/payload.config.ts)

### Collections

#### Pages Collection

- **Path**: `/admin/content/pages`
- **Features**:
  - Rich text editing with Lexical editor
  - Version history (up to 50 versions per document)
  - Autosave every 3 seconds
  - Document locking (5-minute duration)
  - Draft/Published status
  - SEO fields (metaTitle, metaDescription)

#### Media Collection

- **Path**: `/admin/content/media`
- **Supported types**: Images, videos, PDFs
- **Storage**: `public/media/`
- **Required fields**: Alt text for accessibility

#### CMS Admins

- Separate authentication for CMS users
- Roles: Admin, Editor

### Globals

#### Site Settings

- Site name and description
- Contact email
- Social media links
- Maintenance mode toggle

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payload/pages` | GET | List all pages |
| `/api/payload/pages` | POST | Create new page |
| `/api/payload/pages/[id]` | GET | Get page by ID |
| `/api/payload/pages/[id]` | PATCH | Update page |
| `/api/payload/pages/[id]` | DELETE | Delete page |

### Creating a Page

1. Navigate to `/admin/content/pages/new`
2. Fill in required fields:
   - **Title**: Page title (displayed as heading)
   - **Slug**: URL-friendly identifier (e.g., `about-us`)
3. Add content using the rich text editor
4. Set SEO fields (optional)
5. Set status to "Published" when ready
6. Click Save

### Live Preview

- Preview changes before publishing
- Access via the preview button in page editor

---

## CommunityOS

CommunityOS is a **multi-tenant platform** for community organizations. Each organization (tenant) gets their own workspace with access to various apps.

### Architecture

```
/communityos/[tenantId]/
├── dashboard/    # Organization dashboard with app launcher
└── apps/[appId]/ # Individual application pages
```

### Tenant Access

1. Users must be authenticated
2. Users must have access to the specific tenant
3. Access is verified via tenant membership table

### Available CommunityOS Apps

| App | Icon | Description |
|-----|------|-------------|
| CRM | 👥 | Contact and member management |
| Rostering | 📅 | Staff and volunteer scheduling |
| Events & Programs | 🎉 | Event and program management |
| Financial Management | 💰 | Finance and budget tracking |
| Governance Compliance | ⚖️ | Compliance tools |
| Safeguarding Centre | 🛡️ | Child safety and safeguarding |
| Assets Inventory | 📦 | Organizational asset tracking |
| Committee Management | 👔 | Board and committee management |
| Communications Hub | 📢 | Internal communications |
| Fundraising | 🎁 | Fundraising and development |
| Impact Reporting | 📊 | Outcome tracking and reporting |
| Learning & Development | 🎓 | Training and development |
| Lessons & Workshops | 📚 | Educational programs |
| Meetings & Reporting | 📝 | Meeting management |
| Partnerships & MOUs | 🤝 | Partnership management |
| Policy Library | 📋 | Policies and procedures |
| Project Management | 🏗️ | Project tracking |
| Records & Privacy | 🔒 | Records management |
| Risk & Compliance | ⚠️ | Risk management |
| Organisation Dashboard | 🏢 | Overview and analytics |

### Tenant Roles

- **Admin**: Full access to all apps and settings
- **Member**: Access based on permissions
- **Viewer**: Read-only access

---

## PWA & Offline-First Sync (Ditto)

The platform supports **Progressive Web App (PWA)** functionality with offline-first sync powered by Ditto.

### PWA Features

The PWA manifest is configured in [`app/manifest.ts`](file:///home/ryan/Documents/Projects/smalltalk.community/app/manifest.ts):

- **Name**: smalltalk.community
- **Display**: Standalone (native app-like experience)
- **Theme Color**: #4F46E5 (Indigo)
- **Icons**: 192x192 and 512x512 PNG, plus maskable icon

#### Installing the PWA

**On Mobile (iOS/Android)**:

1. Visit the site in your browser
2. Tap "Add to Home Screen" in the browser menu
3. The app will be available from your home screen

**On Desktop (Chrome)**:

1. Look for the install icon in the address bar
2. Click "Install"

### Ditto Sync

Ditto provides **offline-first, real-time sync** for CommunityOS apps.

#### How It Works

1. **Local-First**: Data is stored locally first
2. **Background Sync**: Changes sync automatically when online
3. **Conflict Resolution**: Last-Write-Wins (LWW) strategy
4. **Peer-to-Peer**: Can sync directly between devices

#### Configuration

Located in [`lib/ditto/client.ts`](file:///home/ryan/Documents/Projects/smalltalk.community/lib/ditto/client.ts):

```typescript
// Development Mode (Offline Playground)
const identity = {
    type: "offlinePlayground",
    appID: config.appId,
    token: config.token,
} as IdentityOfflinePlayground;

// Production Mode (Online with Authentication)
const identity = {
    type: "onlineWithAuthentication",
    appID: appId,
    authHandler: { /* Supabase JWT authentication */ }
} as IdentityOnlineWithAuthentication;
```

#### Environment Variables

```bash
DITTO_APP_ID=your-ditto-app-id
DITTO_PLAYGROUND_TOKEN=your-playground-token
```

#### useDittoSync Hook

The [`useDittoSync`](file:///home/ryan/Documents/Projects/smalltalk.community/hooks/useDittoSync.ts) hook provides:

```typescript
const {
    documents,        // Array of synced documents
    isLoading,        // Loading state
    isOnline,         // Online/offline status
    error,            // Any sync errors
    insert,           // Insert new document
    update,           // Update document by ID
    remove,           // Remove document by ID
    upsertDocument,   // Insert or update
    deleteDocument,   // Delete by ID
    refresh,          // Trigger manual refresh
} = useDittoSync({ collection: 'members', tenantId: 'org-123' });
```

#### Conflict Resolution

Located in [`lib/dittoSync.ts`](file:///home/ryan/Documents/Projects/smalltalk.community/lib/dittoSync.ts):

- **resolveConflict()**: Uses Last-Write-Wins based on `updatedAt` timestamp
- **mergeMemberData()**: Merges fields with special handling for skills arrays (union + dedupe)

---

## Available Apps

### Platform Apps

| App | Path | Description |
|-----|------|-------------|
| Volunteer Passport | `/volunteer-passport` | Volunteer profile and opportunity matching |
| Local Music Network | `/local-music-network` | Musicians, bands, gigs, and professionals |
| Peer Support Finder | `/peer-support-finder` | Find peer support services |
| Youth Service Navigator | `/youth-service-navigator` | Youth services directory |
| Work Experience Hub | `/work-experience-hub` | Work experience opportunities |
| Apprenticeship Hub | `/apprenticeship-hub` | Apprenticeship opportunities |

### App Features

Each app typically includes:

- User profiles
- Search and discovery
- Messaging
- Notifications
- Admin moderation

---

## Troubleshooting

### Common Issues

**"Failed to load dashboard statistics"**

- Check database connection in environment variables
- Verify Supabase service key is valid

**Build Failures**

- Run `npm run typecheck` first to find TypeScript errors
- Check for missing environment variables

**PWA Not Installing**

- Ensure HTTPS is enabled
- Check manifest.json is accessible
- Verify service worker is registered

### Useful Commands

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build
npm run build

# Development server
npm run dev

# Run tests
npm test
```

---

## Support

- **Incident Commander**: Ryan Hutchison
- **Email**: <ryanhutchison@outlook.com.au>
- **Backup**: <smalltalkcommunity.backup@gmail.com>

For security issues, see [SECURITY.md](file:///home/ryan/Documents/Projects/smalltalk.community/SECURITY.md).
