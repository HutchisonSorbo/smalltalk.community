# System Architecture

## 🔭 Overview
**smalltalk.community** is a Next.js 14+ application designed for high performance in low-bandwidth environments. It connects users (Musicians, Volunteers, Organisations) through a unified platform backed by Supabase.

## 🛠️ Tech Stack

| Layer | Technology | Decision Reason |
|-------|------------|-----------------|
| **Frontend** | Next.js (App Router) | Server Components reduce client bundle size (critical for low bandwidth). |
| **Styling** | Tailwind CSS + Shadcn/UI | Atomic classes reduce CSS bloat. |
| **Database** | PostgreSQL (Supabase) | Relational integrity, Row Level Security (RLS) built-in. |
| **ORM** | Drizzle ORM | Lightweight, type-safe, no runtime overhead. |
| **Auth** | Supabase Auth | Secure, handles 2FA/Socials out of the box. |
| **CMS** | Payload CMS | Headless content management for dynamic pages. |

---

## 🏛️ Core Concepts

### 1. The "Unified User" Model
We do not have separate tables for `Musicians` vs `Volunteers`.
*   **Base Table:** `users` (Handles Auth, basic profile).
*   **Profiles:** `musician_profiles`, `volunteer_profiles` (Linked 1:1 to `users`).
*   **Why?** A user can be both a musician and a volunteer without needing two accounts.

### 2. Security First (RLS)
We use **Row Level Security** at the database layer.
*   **Principle:** "Never trust the client."
*   **Implementation:** Policies are defined in `shared/schema.ts` alongside the table definitions.
*   **Rule:** Every table *must* have an RLS policy.

### 3. Data Flow
1.  **Client** requests data via Server Action or API Route.
2.  **Server** validates input using **Zod**.
3.  **Drizzle** constructs the SQL query.
4.  **Supabase** executes query *scoped to the user's RLS permissions*.
5.  **Server** returns sanitised JSON.

### 4. Low-Bandwidth Optimization
*   **Server Components:** We fetch data on the server to avoid sending large JSON payloads to the client.
*   **Image Optimization:** All images are processed via Next.js Image Optimization API.
*   **Caching:** We aggressively cache public data (e.g., Gig listings) using `revalidate`.

---

## 📂 Key Directories Map

```
/app
  ├── /admin          # RBAC-protected Admin Dashboard
  ├── /api            # Backend Endpoints (Zod validated)
  ├── /login          # Auth Flow
  └── page.tsx        # Homepage

/lib
  ├── supabase.ts     # Client-side Supabase connection
  ├── supabase-server.ts # Server-side (Cookie-based) connection
  └── onboarding-schemas.ts # Centralized Zod validation

/shared
  └── schema.ts       # THE DATABASE TRUTH. All tables/relations defined here.

/scripts
  └── daily-audit.ts  # Our automated CI/CD guard.
```
