# White-Label Testing Guide

Comprehensive guide for testing multi-tenant/white-label functionality.

> [!IMPORTANT]
> These tests expect environment variables to be set in `.env` or the test configuration:
>
> - `TEST_USER_EMAIL`: Login email for the test user.
> - `TEST_USER_PASSWORD`: Login password for the test user.
> - `TEST_TENANT_B`: Code for the target tenant (e.g., `org2`).

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     Application                          │
├──────────────────────────────────────────────────────────┤
│  Tenant Context (URL: /org/[code]/...)                   │
├──────────────────────────────────────────────────────────┤
│  Row Level Security (RLS) Policies                       │
├──────────────────────────────────────────────────────────┤
│  Supabase Database                                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │  Tenant A  │  │  Tenant B  │  │  Tenant C  │         │
│  │   (stc)    │  │   (org2)   │  │   (org3)   │         │
│  └────────────┘  └────────────┘  └────────────┘         │
└──────────────────────────────────────────────────────────┘
```

## Prerequisites

- **Admin account**: `<ADMIN_TEST_EMAIL>`
- **Non-admin org account**: At least one organisation member without admin role
- **Database access**: Supabase dashboard or CLI

## RLS Policy Verification

### Check RLS is Enabled

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'tenants',
  'tenant_members', 
  'tenant_settings', 
  'tenant_apps',
  'tenant_content'
);
```

**Expected**: All tables show `rowsecurity = true`

### View Active Policies

```sql
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

## Test Matrix

| Test Case | Admin | Non-Admin | Expected |
|-----------|-------|-----------|----------|
| View own org dashboard | ✅ | ✅ | Data visible |
| View other org data | ❌ | ❌ | No access |
| Create member | ✅ | Role-based | Per permissions |
| Update settings | ✅ | ❌ | Admin only |
| Access CommunityOS apps | ✅ | ✅ | Apps visible |
| Cross-tenant query | ❌ | ❌ | Zero rows |

## Manual Test Scenarios

### Scenario 1: Admin Access

1. Login as `<ADMIN_TEST_EMAIL>`
2. Navigate to `/org/stc/dashboard`
3. Verify:
   - [ ] Dashboard loads correctly
   - [ ] All organisation data visible
   - [ ] Settings page accessible
   - [ ] Member management works
   - [ ] CommunityOS apps load

### Scenario 2: Non-Admin Access

1. Login as non-admin organisation user
2. Navigate to `/org/[code]/dashboard`
3. Verify:
   - [ ] Dashboard loads correctly
   - [ ] Own organisation data visible
   - [ ] Appropriate role-based restrictions
   - [ ] Cannot access admin-only features

### Scenario 3: Cross-Tenant Isolation

1. Login as User A (Org A)
2. Manually navigate to `/org/[other-org-code]/dashboard`
3. Verify:
   - [ ] Access denied or redirected
   - [ ] No data from other organisation visible
   - [ ] Audit log captures attempt (if implemented)

### Scenario 4: Context Preservation

1. Login and navigate to organisation dashboard
2. Click through multiple pages
3. Verify:
   - [ ] Tenant code remains in URL
   - [ ] Data remains scoped to current org
   - [ ] No context leakage between navigations

## Automated Testing Examples

### Playwright Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('White-Label Isolation', () => {
  test('user cannot access other tenant data', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;
    const targetTenant = process.env.TEST_TENANT_B || 'tenantB';

    if (!email || !password) throw new Error('Missing test credentials');

    // Login as user from tenant A
    await page.goto('/auth/login');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.click('button[type="submit"]');
    
    // Attempt to access tenant B
    await page.goto(`/org/${targetTenant}/dashboard`);
    
    // Should be denied or redirected
    await expect(page.locator('text=access denied')).toBeVisible();
    // OR
    await expect(page).toHaveURL(/\/org\/tenantA\//);
  });
});
```

### Database Verification Query

```sql
-- As non-admin user, this should return zero rows
SELECT * FROM tenant_members 
WHERE tenant_id != (
  SELECT tenant_id FROM tenant_members 
  WHERE user_id = auth.uid() 
  LIMIT 1
);
```

## Common Pitfalls

### 1. Missing RLS on New Tables

**Problem**: New tables created without RLS enabled

**Solution**: Always include in migration:

```sql
ALTER TABLE new_tenant_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON new_tenant_table
  FOR ALL USING (tenant_id = get_current_tenant_id());
```

### 2. Hardcoded Tenant IDs

**Problem**: Tenant ID hardcoded in queries or components

**Solution**: Always use dynamic lookup:

```typescript
const tenantId = await getTenantIdFromSession();
```

### 3. Service Key in Client Code

**Problem**: Supabase service key used client-side (bypasses RLS)

**Solution**: Always use anon key with RLS:

```typescript
// ✅ Correct
const supabase = createClientComponentClient();

// ❌ Wrong - bypasses RLS
const supabase = createClient(url, SERVICE_ROLE_KEY);
```

### 4. Missing Tenant Context

**Problem**: API routes don't verify tenant context

**Solution**: Always validate:

```typescript
const { tenantId } = await getTenantContext(request);
if (!tenantId) {
  return new Response('Unauthorized', { status: 401 });
}
```

### 5. JOIN Queries Leaking Data

**Problem**: JOINs with non-tenant tables expose data

**Solution**: Always include tenant filter:

```sql
SELECT * FROM tenant_members tm
JOIN users u ON tm.user_id = u.id
WHERE tm.tenant_id = $1;  -- Always filter!
```

## Reporting Issues

When a white-label test fails, document:

1. **Test case**: Which scenario failed
2. **Expected**: What should have happened
3. **Actual**: What actually happened
4. **Evidence**: Screenshots, query results, logs
5. **Root cause**: Initial hypothesis
6. **Fix**: Proposed solution
