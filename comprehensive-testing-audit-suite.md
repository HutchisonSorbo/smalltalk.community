# AI Agent Prompt: Comprehensive Testing & Audit Suite Implementation

## Mission

You are tasked with implementing a production-grade testing infrastructure for **smalltalk.community**, a multi-tenant youth services platform serving regional Victoria, Australia. This system handles sensitive personal data (Teen 13-17, Adult 18-64, Senior 65+) and must meet strict privacy, security, accessibility, and performance standards. The platform enforces a strict 13+ minimum age policy.

Your implementation must be audit-ready for government funding compliance, ACNC reporting, and potential future scale to other nonprofit organisations across Australia.

---

## System Context

### Technology Stack

- **Framework**: Next.js 15.x (App Router), React 18, TypeScript 5.x
- **Database**: Supabase (PostgreSQL 15) with Row Level Security (RLS)
- **Sync Engine**: Ditto offline-first mesh networking
- **Hosting**: Vercel (Edge Functions, CDN)
- **Node**: v22.13.0 (pinned)
- **Package Manager**: pnpm
- **Authentication**: Supabase Auth with RLS policies
- **Storage**: Supabase Storage for documents/photos
- **Email**: Resend or SendGrid (if implemented)

### Critical Data Types

- **Personal Information**: Full names, DOB, addresses, phone numbers, emails
- **Sensitive Data**: Parent/guardian details, emergency contacts, accessibility needs, safeguarding notes
- **Financial Data**: Membership fees, donations, grant funding
- **Consent Records**: Photo/video consent, newsletter opt-ins, data sharing agreements

### Regulatory Requirements

- **Privacy Act 1988** (Australia)
- **ACNC Governance Standards**
- **Victorian Child Safe Standards** (if working with under 18s)
- **WCAG 2.1 AA** (accessibility)
- **GDPR-like** data portability and deletion rights

---

## Phase 1: Foundation Setup

### 1.1 Install Testing Dependencies

```bash
pnpm add -D vitest @vitest/ui @vitest/coverage-v8 \
  @testing-library/react @testing-library/user-event @testing-library/jest-dom \
  playwright @playwright/test \
  @axe-core/playwright axe-core \
  msw \
  lighthouse \
  @supabase/supabase-js \
  dotenv
```

### 1.2 Configuration Files

#### `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/types.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/utils': path.resolve(__dirname, './src/utils'),
    },
  },
});
```

#### `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### `tests/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock Ditto
vi.mock('@dittolive/ditto', () => ({
  init: vi.fn(),
  sync: vi.fn(),
}));

// Mock Supabase
global.fetch = vi.fn();
```

---

## Phase 2: Unit Tests (Critical Business Logic)

### 2.1 Utility Functions

**Location**: `tests/unit/utils/`

#### Age Calculation & Cohort Assignment

```typescript
// tests/unit/utils/age-cohort.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateAge, getAgeCohort } from '@/utils/age-cohort';

describe('Age Calculation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15'));
  });

  it('calculates correct age for someone born 14 March 1994', () => {
    expect(calculateAge('1994-03-14')).toBe(31);
  });

  it('handles birthday not yet occurred this year', () => {
    expect(calculateAge('1994-06-15')).toBe(31);
  });

  it('handles birthday today', () => {
    expect(calculateAge('2000-01-15')).toBe(26);
  });

  it('returns 0 for invalid date', () => {
    expect(calculateAge('')).toBe(0);
    expect(calculateAge(null)).toBe(0);
  });
});

describe('Age Cohort Assignment', () => {
  it('rejects ages under 13', () => {
    expect(getAgeCohort(5)).toBe('Invalid');
    expect(getAgeCohort(12)).toBe('Invalid');
  });

  it('assigns Teen cohort for ages 13-17', () => {
    expect(getAgeCohort(13)).toBe('Teen');
    expect(getAgeCohort(17)).toBe('Teen');
  });

  it('assigns Adult cohort for ages 18-64', () => {
    expect(getAgeCohort(18)).toBe('Adult');
    expect(getAgeCohort(24)).toBe('Adult');
  });

  it('assigns Adult cohort for ages 25-64', () => {
    expect(getAgeCohort(25)).toBe('Adult');
    expect(getAgeCohort(64)).toBe('Adult');
  });

  it('assigns Senior cohort for 65+', () => {
    expect(getAgeCohort(65)).toBe('Senior');
    expect(getAgeCohort(90)).toBe('Senior');
  });

  it('handles edge cases at boundaries', () => {
    expect(getAgeCohort(12.9)).toBe('Invalid');
    expect(getAgeCohort(13.0)).toBe('Teen');
    expect(getAgeCohort(17.9)).toBe('Teen');
    expect(getAgeCohort(18.0)).toBe('Adult');
  });
});
```

#### Privacy & Consent Validation

```typescript
// tests/unit/utils/privacy.test.ts
import { validateConsent, canShareData, requiresEnhancedModeration } from '@/utils/privacy';

describe('Privacy Consent', () => {
  it('requires enhanced moderation for teens 13-17', () => {
    expect(requiresEnhancedModeration(13)).toBe(true);
    expect(requiresEnhancedModeration(17)).toBe(true);
    expect(requiresEnhancedModeration(18)).toBe(false);
  });

  it('prevents data sharing without explicit consent', () => {
    const member = { privacy: { dataSharingConsent: false } };
    expect(canShareData(member)).toBe(false);
  });

  it('validates photo consent is explicit', () => {
    expect(validateConsent('Yes')).toBe(true);
    expect(validateConsent('No')).toBe(true);
    expect(validateConsent('')).toBe(false);
  });
});
```

#### Australian Data Validation

```typescript
// tests/unit/utils/au-validation.test.ts
import { validatePhone, validatePostcode, formatAUD } from '@/utils/au-validation';

describe('Australian Phone Validation', () => {
  it('accepts valid mobile formats', () => {
    expect(validatePhone('0412 345 678')).toBe(true);
    expect(validatePhone('0412345678')).toBe(true);
    expect(validatePhone('+61 412 345 678')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(validatePhone('1234')).toBe(false);
    expect(validatePhone('0312 345 678')).toBe(false); // Invalid area code
  });
});

describe('Victorian Postcode Validation', () => {
  it('accepts valid VIC postcodes', () => {
    expect(validatePostcode('3757', 'VIC')).toBe(true); // Kilmore
    expect(validatePostcode('3660', 'VIC')).toBe(true); // Seymour
  });

  it('rejects non-VIC postcodes for VIC addresses', () => {
    expect(validatePostcode('2000', 'VIC')).toBe(false); // NSW
  });
});

describe('Currency Formatting', () => {
  it('formats AUD correctly', () => {
    expect(formatAUD(1234.56)).toBe('$1,234.56');
    expect(formatAUD(0)).toBe('$0.00');
  });
});
```

### 2.2 Engagement Risk Scoring

```typescript
// tests/unit/models/engagement.test.ts
import { calculateRiskLevel, getRiskRecommendations } from '@/lib/engagement';

describe('Engagement Risk Calculation', () => {
  it('assigns Green risk for recent contact', () => {
    const member = {
      engagement: {
        lastContactDate: '2026-01-10', // 5 days ago
        totalInteractions: 5,
      },
    };
    expect(calculateRiskLevel(member)).toBe('Green');
  });

  it('assigns Amber risk for 30-60 day gap', () => {
    const member = {
      engagement: {
        lastContactDate: '2025-12-10', // ~35 days ago
        totalInteractions: 5,
      },
    };
    expect(calculateRiskLevel(member)).toBe('Amber');
  });

  it('assigns Red risk for 60+ day gap', () => {
    const member = {
      engagement: {
        lastContactDate: '2025-10-01', // 100+ days ago
        totalInteractions: 2,
      },
    };
    expect(calculateRiskLevel(member)).toBe('Red');
  });

  it('provides actionable recommendations for at-risk members', () => {
    const recommendations = getRiskRecommendations('Red');
    expect(recommendations).toContain('immediate outreach');
  });
});
```

### 2.3 Multi-Tenant Data Isolation

```typescript
// tests/unit/lib/tenant.test.ts
import { getTenantMembers, validateTenantAccess } from '@/lib/tenant';

describe('Tenant Data Isolation', () => {
  it('only returns members for current tenant', async () => {
    const tenantAMembers = await getTenantMembers('tenant-a');
    expect(tenantAMembers.every(m => m.tenantId === 'tenant-a')).toBe(true);
  });

  it('throws error when accessing cross-tenant data', () => {
    expect(() => validateTenantAccess('tenant-a', 'member-from-tenant-b')).toThrow();
  });

  it('enforces RLS policy at query level', async () => {
    // Mock Supabase query with wrong tenant context
    // Expect empty result or error
  });
});
```

### 2.4 Ditto Sync Conflict Resolution

```typescript
// tests/unit/lib/dittoSync.test.ts
import { resolveConflict, mergeMemberData } from '@/lib/dittoSync';

describe('Ditto Sync Conflicts', () => {
  it('uses last-write-wins for simple fields', () => {
    const local = { email: 'old@example.com', updatedAt: '2026-01-14' };
    const remote = { email: 'new@example.com', updatedAt: '2026-01-15' };
    const resolved = resolveConflict(local, remote);
    expect(resolved.email).toBe('new@example.com');
  });

  it('merges arrays without duplicates', () => {
    const local = { skills: ['JavaScript', 'Python'] };
    const remote = { skills: ['Python', 'Rust'] };
    const merged = mergeMemberData(local, remote);
    expect(merged.skills).toEqual(['JavaScript', 'Python', 'Rust']);
  });

  it('preserves privacy consent from most recent explicit change', () => {
    // Critical: never downgrade consent without explicit user action
  });
});
```

---

## Phase 3: Integration Tests (Component & Feature Level)

### 3.1 Member Form Integration

```typescript
// tests/integration/components/member-form.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberForm } from '@/components/crm/member-form';

describe('Member Form Integration', () => {
  it('auto-calculates age cohort when DOB entered', async () => {
    const user = userEvent.setup();
    render(<MemberForm onSave={vi.fn()} />);

    await user.type(screen.getByLabelText(/date of birth/i), '2008-06-15');

    await waitFor(() => {
      expect(screen.getByText('Youth')).toBeInTheDocument();
    });
  });

  it('validates required fields before submission', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<MemberForm onSave={onSave} />);

    await user.click(screen.getByText(/save member/i));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
  });

  it('triggers enhanced moderation for teen cohort', async () => {
    const user = userEvent.setup();
    render(<MemberForm onSave={vi.fn()} />);

    await user.type(screen.getByLabelText(/date of birth/i), '2010-01-01'); // Age 16

    await waitFor(() => {
      // Expectation depends on UI implementation of enhanced moderation
      // e.g., a badge, specific notice, or internal state flag check
      expect(screen.getByText(/enhanced moderation/i)).toBeInTheDocument();
    });
  });

  it('persists data across stepper navigation', async () => {
    const user = userEvent.setup();
    render(<MemberForm onSave={vi.fn()} />);

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.click(screen.getByText(/next step/i));
    await user.click(screen.getByText(/back/i));

    expect(screen.getByLabelText(/full name/i)).toHaveValue('Jane Doe');
  });
});
```

### 3.2 Communication Log Feature

```typescript
// tests/integration/features/CommunicationLog.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommunicationLog } from '@/components/crm/CommunicationLog';

describe('Communication Logging', () => {
  it('creates new log entry and updates member engagement', async () => {
    const user = userEvent.setup();
    const updateEngagement = vi.fn();

    render(<CommunicationLog members={mockMembers} onUpdate={updateEngagement} />);

    await user.click(screen.getByText(/log interaction/i));
    await user.selectOptions(screen.getByLabelText(/member/i), 'member-123');
    await user.type(screen.getByLabelText(/summary/i), 'Phone check-in about program interest');
    await user.click(screen.getByText(/save/i));

    await waitFor(() => {
      expect(updateEngagement).toHaveBeenCalledWith(
        expect.objectContaining({ lastContactDate: expect.any(String) })
      );
    });
  });

  it('flags follow-up tasks and displays in dashboard', async () => {
    const user = userEvent.setup();

    render(<CommunicationLog members={mockMembers} />);

    await user.click(screen.getByText(/log interaction/i));
    await user.check(screen.getByLabelText(/follow-up required/i));
    await user.type(screen.getByLabelText(/follow-up date/i), '2026-02-01');
    await user.click(screen.getByText(/save/i));

    expect(screen.getByText(/follow-up due/i)).toBeInTheDocument();
  });
});
```

### 3.3 Referral Integration Bridge

```typescript
// tests/integration/features/referral-bridge.test.ts
import { createReferral, syncToTenantCRM } from '@/lib/integration-bridge';

describe('Public Hub to CRM Referral Flow', () => {
  it('creates referral from Apprenticeship Hub submission', async () => {
    const submission = {
      name: 'John Smith',
      email: 'john@example.com',
      industry: 'Construction',
      source: 'apprenticeship-hub',
    };

    const referral = await createReferral(submission, 'smalltalk-tenant');

    expect(referral).toMatchObject({
      tenantId: 'smalltalk-tenant',
      status: 'New',
      sourceHub: 'apprenticeship-hub',
    });
  });

  it('maps hub fields to CRM member schema correctly', () => {
    const hubData = { name: 'Jane Doe', contactNumber: '0412345678' };
    const memberData = mapHubToCRM(hubData);

    expect(memberData.basicInfo.fullName).toBe('Jane Doe');
    expect(memberData.basicInfo.phone).toBe('0412345678');
  });

  it('creates member in CRM when referral accepted', async () => {
    const referral = { id: 'ref-123', status: 'New' };

    await acceptReferral(referral.id);

    const member = await getMemberByReferral('ref-123');
    expect(member).toBeDefined();
    expect(member.membership.status).toBe('Active');
  });
});
```

---

## Phase 4: End-to-End Tests (Real User Flows)

### 4.1 Complete Member Onboarding Journey

```typescript
// tests/e2e/member-onboarding.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Member Onboarding Flow', () => {
  test('Youth worker onboards new youth participant', async ({ page }) => {
    // Login as youth worker
    await page.goto('/login');
    await page.fill('[name="email"]', 'ryan@smalltalk.community');
    await page.fill('[name="password"]', process.env.TEST_PASSWORD);
    await page.click('text=Sign In');

    // Navigate to CRM
    await page.goto('/communityos/crm');
    await expect(page.locator('h1:has-text("CRM")')).toBeVisible();

    // Add new member
    await page.click('text=Add Member');

    // Step 1: Basic Info
    await page.fill('#fname', 'Sarah Johnson');
    await page.fill('#pname', 'Saz');
    await page.fill('#email', 'sarah.j@example.com');
    await page.fill('#phone', '0412 345 678');
    await page.fill('#dob', '2008-03-20'); // Youth cohort
    await expect(page.locator('text=Youth')).toBeVisible();
    await page.click('text=Next Step');

    // Step 2: Contact Details
    await page.fill('#street', '42 Sydney Street');
    await page.fill('#suburb', 'Kilmore');
    await page.selectOption('#state', 'VIC');
    await page.fill('#postcode', '3757');
    await page.selectOption('#region', 'Mitchell Shire');
    await page.click('text=Next Step');

    // Step 3: Membership
    await page.selectOption('#mtype', 'Community Participant');
    await page.selectOption('#mstatus', 'Active');
    await expect(page.locator('#mid')).toHaveValue(/ST-\d{6}/); // Auto-generated ID
    await page.click('text=Next Step');

    // Step 4: Additional Info (safeguarding)
    await page.fill('#parent', 'Michelle Johnson');
    await page.fill('#ephone', '0423 456 789');
    await page.fill('#acc', 'None');
    await page.check('text=Newsletter Opt-in');
    await page.fill('textarea', 'Interested in badminton program');
    await page.click('text=Save Member');

    // Verify member appears in registry
    await expect(page.locator('text=Sarah Johnson')).toBeVisible();
    await expect(page.locator('text=Youth')).toBeVisible();
    await expect(page.locator('text=sarah.j@example.com')).toBeVisible();

    // Verify engagement risk is Green (new member)
    const row = page.locator('tr', { has: page.locator('text=Sarah Johnson') });
    await expect(row.locator('text=Green')).toBeVisible();
  });

  test('Form validation prevents submission with missing required fields', async ({ page }) => {
    await page.goto('/communityos/crm');
    await page.click('text=Add Member');

    // Try to save without filling required fields
    await page.click('text=Next Step');
    await page.click('text=Next Step');
    await page.click('text=Next Step');
    await page.click('text=Save Member');

    // Should show validation errors
    await expect(page.locator('text=Full Name is required') || page.locator('[role="alert"]')).toBeVisible();
  });
});
```

### 4.2 Offline Sync Recovery

```typescript
// tests/e2e/offline-sync.spec.ts
test('Member created offline syncs when connection restored', async ({ page, context }) => {
  await page.goto('/communityos/crm');

  // Go offline
  await context.setOffline(true);
  await expect(page.locator('text=Local Mode')).toBeVisible();

  // Create member while offline
  await page.click('text=Add Member');
  await page.fill('#fname', 'Offline Test Member');
  await page.fill('#email', 'offline@test.com');
  // ... fill other required fields
  await page.click('text=Save Member');

  // Verify member saved locally
  await expect(page.locator('text=Offline Test Member')).toBeVisible();

  // Reconnect
  await context.setOffline(false);
  await page.waitForTimeout(2000); // Wait for sync

  // Verify sync indicator shows "Mesh Connected"
  await expect(page.locator('text=Mesh Connected')).toBeVisible();

  // Refresh and verify data persisted
  await page.reload();
  await expect(page.locator('text=Offline Test Member')).toBeVisible();
});
```

### 4.3 Role-Based Access Control

```typescript
// tests/e2e/rbac.spec.ts
test.describe('Role-Based Access Control', () => {
  test('Volunteer cannot access financial data', async ({ page }) => {
    await loginAs(page, 'volunteer@smalltalk.community');

    await page.goto('/communityos/financial');

    // Should be redirected or see access denied
    await expect(page.locator('text=Access Denied') || page.locator('text=Insufficient Permissions')).toBeVisible();
  });

  test('Admin can access all CommunityOS apps', async ({ page }) => {
    await loginAs(page, 'ryan@smalltalk.community'); // Admin

    const apps = [
      '/communityos/crm',
      '/communityos/financial',
      '/communityos/assets',
      '/communityos/governance',
    ];

    for (const app of apps) {
      await page.goto(app);
      await expect(page.locator('h1')).toBeVisible();
      // Should not see access denied
      await expect(page.locator('text=Access Denied')).not.toBeVisible();
    }
  });
});
```

### 4.4 Data Export & Privacy Compliance

```typescript
// tests/e2e/data-export.spec.ts
test('Member can request and receive data export (GDPR-like)', async ({ page }) => {
  await page.goto('/communityos/crm');

  // Find specific member
  await page.fill('[placeholder*="Search"]', 'Ryan Hutchison');
  await page.click('text=Ryan Hutchison');

  // Export member data
  await page.click('text=Export Data');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('text=Download JSON'),
  ]);

  const path = await download.path();
  const content = await fs.readFile(path, 'utf-8');
  const data = JSON.parse(content);

  // Verify all personal data included
  expect(data.basicInfo.fullName).toBe('Ryan Hutchison');
  expect(data.basicInfo.email).toBeDefined();
  expect(data.communications).toBeDefined();
  expect(data.privacy).toBeDefined();
});

test('Member deletion removes all associated data', async ({ page }) => {
  await page.goto('/communityos/crm');

  const testMember = 'DELETE_TEST_MEMBER';
  await page.fill('[placeholder*="Search"]', testMember);
  await page.click(`text=${testMember}`);
  await page.click('text=Delete Member');
  await page.click('text=Confirm Permanent Deletion');

  // Verify member not in registry
  await page.fill('[placeholder*="Search"]', testMember);
  await expect(page.locator(`text=${testMember}`)).not.toBeVisible();

  // Verify communications also deleted
  await page.goto('/communityos/communications');
  await page.fill('[placeholder*="Search"]', testMember);
  await expect(page.locator(`text=${testMember}`)).not.toBeVisible();
});
```

---

## Phase 5: Accessibility Audits (WCAG 2.1 AA Compliance)

### 5.1 Automated Accessibility Testing

```typescript
// tests/accessibility/wcag-audit.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('WCAG 2.1 AA Compliance', () => {
  test('Homepage has no accessibility violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('CRM Member Form is fully accessible', async ({ page }) => {
    await page.goto('/communityos/crm');
    await page.click('text=Add Member');

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });

  test('All 19 CommunityOS apps pass accessibility audit', async ({ page }) => {
    const apps = [
      '/communityos/crm',
      '/communityos/assets',
      '/communityos/financial',
      '/communityos/governance',
      '/communityos/hr',
      '/communityos/projects',
      '/communityos/fundraising',
      '/communityos/events',
      '/communityos/learning',
      '/communityos/compliance',
      '/communityos/partnerships',
      '/communityos/rostering',
      '/communityos/safeguarding',
      '/communityos/inventory',
      '/communityos/volunteers',
      '/communityos/analytics',
      '/communityos/communications',
      '/communityos/reports',
      '/communityos/settings',
    ];

    for (const app of apps) {
      await page.goto(app);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations, `${app} has violations`).toEqual([]);
    }
  });
});
```

### 5.2 Keyboard Navigation

```typescript
// tests/accessibility/keyboard-nav.spec.ts
test('Complete member form using only keyboard', async ({ page }) => {
  await page.goto('/communityos/crm');

  // Tab to "Add Member" button
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  // ... repeat until focused
  await page.keyboard.press('Enter');

  // Fill form using Tab and keyboard input only
  await page.keyboard.type('Ryan Hutchison');
  await page.keyboard.press('Tab');
  await page.keyboard.type('Ryan');
  await page.keyboard.press('Tab');
  await page.keyboard.type('ryan@smalltalk.community');
  // ... continue

  // Submit using Enter key
  await page.keyboard.press('Enter');

  // Verify success
  await expect(page.locator('text=Member saved')).toBeVisible();
});

test('Modal focus trap works correctly', async ({ page }) => {
  await page.goto('/communityos/crm');
  await page.click('text=Add Member');

  // Focus should be trapped inside modal
  const modal = page.locator('[role="dialog"]');
  await expect(modal).toBeFocused();

  // Tab through all focusable elements
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA']).toContain(focused);
  }

  // Escape closes modal
  await page.keyboard.press('Escape');
  await expect(modal).not.toBeVisible();
});
```

### 5.3 Screen Reader Testing

```typescript
// tests/accessibility/screen-reader.spec.ts
test('Form inputs have proper ARIA labels', async ({ page }) => {
  await page.goto('/communityos/crm');
  await page.click('text=Add Member');

  // Check all inputs have labels
  const inputs = await page.locator('input:not([type="hidden"])').all();

  for (const input of inputs) {
    const ariaLabel = await input.getAttribute('aria-label');
    const ariaLabelledBy = await input.getAttribute('aria-labelledby');
    const id = await input.getAttribute('id');
    const hasLabel = ariaLabel || ariaLabelledBy || (id && await page.locator(`label[for="${id}"]`).count() > 0);

    expect(hasLabel, 'Input must have associated label').toBeTruthy();
  }
});

test('Dynamic content announces changes', async ({ page }) => {
  await page.goto('/communityos/crm');

  // Check for live regions
  await expect(page.locator('[aria-live]')).toBeVisible();

  // Trigger change and verify announcement
  await page.fill('[placeholder*="Search"]', 'Ryan');

  const liveRegion = page.locator('[aria-live="polite"]');
  await expect(liveRegion).toContainText(/\d+ results?/i);
});
```

---

## Phase 6: Performance & Core Web Vitals

### 6.1 Lighthouse CI Integration

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22.13.0'
      - run: npm install -g @lhci/cli
      - run: pnpm install
      - run: pnpm build
      - run: lhci autorun
```

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm start',
      url: [
        'http://localhost:3000',
        'http://localhost:3000/communityos/crm',
        'http://localhost:3000/hubs/apprenticeships',
      ],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### 6.2 Performance Budget Tests

```typescript
// tests/performance/core-web-vitals.spec.ts
test.describe('Core Web Vitals', () => {
  test('Homepage loads within performance budget', async ({ page }) => {
    await page.goto('/');

    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve({
            FCP: entries.find(e => e.name === 'first-contentful-paint')?.startTime,
            LCP: entries.find(e => e.entryType === 'largest-contentful-paint')?.startTime,
          });
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      });
    });

    expect(metrics.FCP).toBeLessThan(1500); // ms
    expect(metrics.LCP).toBeLessThan(2500);
  });

  test('CRM loads 1000 members without performance degradation', async ({ page }) => {
    await page.goto('/communityos/crm');

    const startTime = Date.now();
    await page.waitForSelector('table tbody tr:nth-child(20)');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(2000); // Should render in under 2 seconds
  });

  test('Offline PWA startup is fast', async ({ page, context }) => {
    // First visit
    await page.goto('/communityos/crm');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Reload (should load from cache)
    const startTime = Date.now();
    await page.reload();
    await page.waitForSelector('h1');
    const offlineLoadTime = Date.now() - startTime;

    expect(offlineLoadTime).toBeLessThan(1000); // Cache should be very fast
  });
});
```

### 6.3 Bundle Size Monitoring

```typescript
// tests/performance/bundle-size.test.ts
import { readFileSync } from 'fs';
import { gzipSync } from 'zlib';

test('JavaScript bundle stays under 300KB gzipped', () => {
  const bundle = readFileSync('.next/static/chunks/main.js');
  const gzipped = gzipSync(bundle);
  const sizeKB = gzipped.length / 1024;

  expect(sizeKB).toBeLessThan(300);
});

test('No duplicate dependencies in bundle', async () => {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);

  const { stdout } = await execAsync('pnpm why react');
  const versions = stdout.match(/react@[\d.]+/g);
  const uniqueVersions = [...new Set(versions)];

  expect(uniqueVersions.length).toBe(1); // Only one version of React
});
```

---

## Phase 7: Security Testing

### 7.1 SQL Injection Prevention

```typescript
// tests/security/sql-injection.spec.ts
test('Search inputs are protected against SQL injection', async ({ page }) => {
  await page.goto('/communityos/crm');

  const maliciousInputs = [
    "'; DROP TABLE members; --",
    "1' OR '1'='1",
    "admin'--",
    "<script>alert('xss')</script>",
  ];

  for (const input of maliciousInputs) {
    await page.fill('[placeholder*="Search"]', input);
    await page.waitForTimeout(500);

    // Should not crash or expose data
    await expect(page.locator('table')).toBeVisible();
  }
});
```

### 7.2 XSS Protection

```typescript
// tests/security/xss.spec.ts
test('User-generated content is sanitised', async ({ page }) => {
  await page.goto('/communityos/crm');
  await page.click('text=Add Member');

  // Try to inject script in name field
  await page.fill('#fname', '<script>alert("XSS")</script>');
  await page.fill('#email', 'test@example.com');
  // ... fill other required fields
  await page.click('text=Save Member');

  // Verify script is escaped, not executed
  const content = await page.content();
  expect(content).toContain('&lt;script&gt;');
  expect(content).not.toContain('<script>alert');

  // Verify no alert appeared
  page.on('dialog', () => {
    throw new Error('Alert dialog should not appear (XSS vulnerability)');
  });
});
```

### 7.3 Authentication & Session Security

```typescript
// tests/security/auth.spec.ts
test('Expired sessions redirect to login', async ({ page }) => {
  await loginAs(page, 'ryan@smalltalk.community');

  // Clear session cookie
  await page.context().clearCookies();

  await page.goto('/communityos/crm');

  // Should redirect to login
  await expect(page).toHaveURL(/\/login/);
});

test('CSRF token validated on form submissions', async ({ page, request }) => {
  await loginAs(page, 'ryan@smalltalk.community');

  // Try to submit form without CSRF token
  const response = await request.post('/api/members', {
    data: { name: 'Test' },
    // Deliberately omit CSRF token
  });

  expect(response.status()).toBe(403);
});
```

### 7.4 Row-Level Security (RLS) Enforcement

```typescript
// tests/security/rls.spec.ts
import { createClient } from '@supabase/supabase-js';

test('Tenant A cannot read Tenant B member data', async () => {
  const supabaseTenantA = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );

  // Authenticate as Tenant A user
  await supabaseTenantA.auth.signInWithPassword({
    email: 'tenantA@example.com',
    password: process.env.TEST_PASSWORD,
  });

  // Try to query Tenant B data
  const { data, error } = await supabaseTenantA
    .from('members')
    .select('*')
    .eq('tenant_id', 'tenant-b');

  // Should return empty or error
  expect(data).toEqual([]);
});

test('RLS prevents cross-tenant updates', async () => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  await supabase.auth.signInWithPassword({
    email: 'tenantA@example.com',
    password: process.env.TEST_PASSWORD,
  });

  // Try to update member from different tenant
  const { error } = await supabase
    .from('members')
    .update({ email: 'hacked@example.com' })
    .eq('id', 'member-from-tenant-b');

  expect(error).toBeDefined();
  expect(error.code).toBe('PGRST301'); // Row-level security violation
});
```

### 7.5 Sensitive Data Encryption

```typescript
// tests/security/encryption.spec.ts
test('Phone numbers are encrypted in database', async () => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Service role bypasses RLS for testing
  );

  // Create member with phone number
  const { data: member } = await supabase
    .from('members')
    .insert({
      full_name: 'Encryption Test',
      phone: '0412345678',
      tenant_id: 'test-tenant',
    })
    .select()
    .single();

  // Query raw database
  const { data: rawData } = await supabase
    .from('members')
    .select('phone')
    .eq('id', member.id)
    .single();

  // Phone should be encrypted (not plaintext)
  expect(rawData.phone).not.toBe('0412345678');
  expect(rawData.phone).toMatch(/^[A-Za-z0-9+/=]+$/); // Base64 pattern
});
```

### 7.6 Rate Limiting

```typescript
// tests/security/rate-limiting.spec.ts
test('API rate limits prevent brute force attacks', async ({ request }) => {
  const attempts = [];

  // Try 20 rapid login attempts
  for (let i = 0; i < 20; i++) {
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'wrong-password',
      },
    });
    attempts.push(response.status());
  }

  // Should start rejecting with 429 Too Many Requests
  const rateLimited = attempts.filter(status => status === 429);
  expect(rateLimited.length).toBeGreaterThan(0);
});
```

---

## Phase 8: Continuous Integration & Deployment

### 8.1 GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '22.13.0'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test:unit

      - name: Generate coverage report
        run: pnpm test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '22.13.0'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '22.13.0'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm playwright install --with-deps
      - run: pnpm build
      - run: pnpm test:e2e

      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  accessibility-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '22.13.0'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm playwright install chromium
      - run: pnpm test:a11y

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Run npm audit
        run: pnpm audit --audit-level=moderate

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '22.13.0'
          cache: 'pnpm'

      - run: pnpm install
      - run: npm install -g @lhci/cli
      - run: pnpm build
      - run: lhci autorun

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: [unit-tests, integration-tests, e2e-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [unit-tests, integration-tests, e2e-tests, accessibility-audit, security-scan]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

### 8.2 Package Scripts

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --coverage",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:a11y": "playwright test tests/accessibility",
    "test:security": "playwright test tests/security",
    "test:performance": "playwright test tests/performance",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest",
    "test:all": "pnpm test:unit && pnpm test:integration && pnpm test:e2e && pnpm test:a11y",
    "lighthouse:local": "lhci autorun",
    "audit:deps": "pnpm audit --audit-level=moderate",
    "audit:types": "tsc --noEmit"
  }
}
```

---

## Phase 9: Monitoring & Observability

### 9.1 Error Tracking Setup

```typescript
// src/lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    // Don't send PII to Sentry
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});
```

### 9.2 Performance Monitoring

```typescript
// tests/monitoring/performance-alerts.test.ts
test('Alert fires when API response time exceeds threshold', async () => {
  const slowEndpoint = '/api/members?limit=1000';
  const startTime = Date.now();

  await fetch(slowEndpoint);

  const duration = Date.now() - startTime;

  // Alert if query takes over 3 seconds
  if (duration > 3000) {
    console.error(`ALERT: ${slowEndpoint} took ${duration}ms`);
  }

  expect(duration).toBeLessThan(3000);
});
```

### 9.3 Uptime & Health Checks

```typescript
// tests/monitoring/health-check.spec.ts
test('Health check endpoint responds within 500ms', async ({ request }) => {
  const startTime = Date.now();

  const response = await request.get('/api/health');

  const duration = Date.now() - startTime;

  expect(response.status()).toBe(200);
  expect(duration).toBeLessThan(500);

  const body = await response.json();
  expect(body).toMatchObject({
    status: 'healthy',
    database: 'connected',
    ditto: 'connected',
  });
});
```

---

## Phase 10: Documentation & Reporting

### 10.1 Test Documentation

Create `TESTING.md` in your repository root:

\`\`\`markdown

# Testing Documentation

## Running Tests Locally

### Unit Tests

\`\`\`bash
pnpm test:unit
\`\`\`

### Integration Tests

\`\`\`bash
pnpm test:integration
\`\`\`

### E2E Tests

\`\`\`bash
pnpm test:e2e
\`\`\`

### Accessibility Tests

\`\`\`bash
pnpm test:a11y
\`\`\`

## Coverage Requirements

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 75%
- **Statements**: 80%

## Test Database Setup

See `.env.test.example` for required environment variables.

## CI/CD Pipeline

All tests run automatically on push and pull requests. See `.github/workflows/ci.yml`.
\`\`\`

### 10.2 Coverage Badges

Add to your README.md:

\`\`\`markdown
![Tests](https://github.com/yourusername/smalltalk-community/actions/workflows/ci.yml/badge.svg)
![Coverage](https://codecov.io/gh/yourusername/smalltalk-community/branch/main/graph/badge.svg)
![Accessibility](https://img.shields.io/badge/WCAG-2.1%20AA-green)
\`\`\`

---

## Success Criteria Checklist

- [ ] All 19 CommunityOS apps have E2E tests covering core user flows
- [ ] Unit test coverage exceeds 80% for business logic
- [ ] All pages pass WCAG 2.1 AA accessibility audit
- [ ] Lighthouse scores: Performance >90, Accessibility >95, Best Practices >90
- [ ] Security tests cover SQL injection, XSS, CSRF, and RLS enforcement
- [ ] CI/CD pipeline runs all tests on every PR and blocks merge if failing
- [ ] Offline sync conflict resolution is fully tested
- [ ] Multi-tenant data isolation is verified with integration tests
- [ ] Privacy compliance tests verify GDPR-like data export and deletion
- [ ] Performance budgets enforced for Core Web Vitals (LCP <2.5s, CLS <0.1)

---

## Maintenance Guidelines

### Running Tests Regularly

- Run full test suite before every deployment
- Run accessibility tests when adding new UI components
- Run performance tests monthly to catch regressions
- Update test data annually to reflect current member demographics

### Updating Tests

- When adding new features, add corresponding tests first (TDD)
- When fixing bugs, write a failing test that reproduces the bug, then fix it
- Review and update test fixtures quarterly to match production data patterns
- Archive or remove tests for deprecated features

### Monitoring Test Health

- Review CI/CD failures weekly
- Address flaky tests immediately (isolate or fix root cause)
- Track test execution time and optimise slow tests
- Maintain test documentation alongside code changes

---

## Support & Resources

### Documentation

- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Axe Accessibility Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)

### Community

- Report testing issues to `ryan@smalltalk.community`
- Contribute test improvements via pull requests
- Share testing patterns in team documentation

---

**Created**: 15 January 2026  
**Version**: 1.0  
**Maintained by**: smalltalk.community  
**License**: MIT (or your chosen license)
