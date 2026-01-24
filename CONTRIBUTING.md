# Contributing to smalltalk.community

👋 Welcome! We're excited you're here. We are building a **community-first platform** for Victoria's creative services, and we want this codebase to be as welcoming as the community itself.

This project is built by both Humans and AI. We strive for **"No Slop"**—meaning code should be intentional, clean, and well-documented.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v20+ (LTS)
- **npm** v10+
- **Supabase CLI** (for local DB)

### Setup
```bash
# 1. Clone the repo
git clone https://github.com/HutchisonSorbo/smalltalk.community.git
cd smalltalk.community

# 2. Install dependencies
npm install

# 3. Setup Environment
cp .env.example .env.local
# Ask the team for the development keys or setup local Supabase

# 4. Run the development server
npm run dev
```

---

## 🏗️ Project Structure

| Directory | Purpose |
|-----------|---------|
| `app/` | **Next.js App Router**. The core pages and API routes. |
| `components/` | **React Components**. Shared UI (`ui/`) and feature-specific components. |
| `lib/` | **Business Logic**. Helper functions, Supabase clients, Zod schemas. |
| `shared/` | **Database Schema**. Drizzle ORM definitions (single source of truth). |
| `scripts/` | **Automation**. Database seeding, audits, maintenance scripts. |
| `tests/` | **Testing**. E2E (Playwright) and Unit (Vitest) tests. |

---

## 📏 Coding Standards (The "No Slop" Rules)

We use **TypeScript** in Strict Mode. Please adhere to these rules:

1.  **No `any`**: Use proper types. If you're stuck, ask or use `unknown`.
2.  **Zod Everything**: All API inputs must be validated with Zod.
3.  **Comments**: Explain *WHY*, not *WHAT*.
    *   ❌ `// Sets user to active`
    *   ✅ `// User must be active to bypass the age-gate check during onboarding`
4.  **Mobile First**: All UI components must work on mobile. We serve low-bandwidth users.
5.  **Images**: Use `<Image />` from `next/image`. Never `<img>`.

### Linting & formatting
We use ESLint and Prettier.
```bash
npm run check  # Runs Type checking
npm audit      # Checks for security vulnerabilities
```

---

## 🧪 Testing

We value confidence over coverage.
*   **Unit Tests (`vitest`):** For utilities and complex logic in `lib/`.
*   **E2E Tests (`playwright`):** For critical user flows (Login, Onboarding).

```bash
npm test       # Run unit tests
npx playwright test # Run E2E tests
```

---

## 🤝 Pull Request Process

1.  Create a branch: `feature/my-cool-feature` or `fix/annoying-bug`.
2.  **Run the Daily Audit Script**: `npx tsx scripts/daily-audit.ts` to ensure you pass our security/performance checks.
3.  Open a PR.
4.  Wait for the automated checks to pass.

Thank you for helping us build a better platform! 
