---
description: Test multi-tenant/white-label functionality with stop-on-failure enforcement
---

## Purpose

Verify organisation isolation and white-label features work correctly. Agent STOPS if failures found.

> [!CAUTION]
> This workflow enforces a hard gate. Agent cannot proceed until all tests pass.

## Prerequisites

- Access to admin account: `smalltalkcommunity.backup@gmail.com`
- Access to at least one non-admin organisation account
- Database access for RLS verification
- Dev server running

## Steps

### 1. Verify RLS Policy Configuration

```sql
-- Check RLS is enabled on all tenant-scoped tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'tenant_members', 
  'tenant_settings', 
  'tenant_apps',
  'tenant_content'
);

-- Verify RLS policies exist
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

**Expected**: All tenant tables have `rowsecurity = true` and appropriate policies.

### 2. Gate: Admin Account Test

> [!CAUTION]
> **STOP-ON-FAILURE**: If ANY feature fails, stop, fix, and re-test.

1. Login as admin: `smalltalkcommunity.backup@gmail.com`
2. Navigate to organisation features:
   - [ ] Dashboard loads correctly
   - [ ] CommunityOS apps accessible
   - [ ] Member management works
   - [ ] Settings page functional
   - [ ] All organisation data visible

### 3. Gate: Non-Admin Account Test

> [!CAUTION]
> **STOP-ON-FAILURE**: If isolation failure detected, stop, fix, and re-test.

1. Login as non-admin organisation user
2. Verify same features accessible:
   - [ ] Dashboard loads correctly
   - [ ] Appropriate apps accessible (based on role)
   - [ ] Own organisation data visible
   - [ ] Other organisations' data NOT visible

### 4. Cross-Tenant Isolation Test

Test data isolation between organisations:

```sql
-- As non-admin user, attempt to query other tenant's data
-- This should return zero rows if RLS is working
SELECT * FROM tenant_members 
WHERE tenant_id != 'current_user_tenant_id';
```

**Expected**: Zero rows returned (RLS blocks cross-tenant access).

### 5. Tenant Context Preservation

Navigate between pages and verify:

- [ ] Tenant code persists in URL (`/org/[code]/...`)
- [ ] Data remains scoped to current organisation
- [ ] Switching organisations updates all data
- [ ] No data leakage during navigation

### 6. White-Label Customisation (if applicable)

- [ ] Organisation branding applies correctly
- [ ] Theme colours render as expected
- [ ] Custom logos display
- [ ] Custom domain routing works (if configured)

## Output

### Test Report

| Gate | Result | Notes |
|------|--------|-------|
| RLS Configuration | ✅/❌ | (tables checked) |
| Admin Account | ✅/❌ | (features tested) |
| Non-Admin Account | ✅/❌ | (features tested) |
| Cross-Tenant Isolation | ✅/❌ | (isolation verified) |
| Context Preservation | ✅/❌ | (navigation tested) |
| White-Label | ✅/❌ | (customisation verified) |

### Issues Fixed

| Issue | Root Cause | Fix Applied | Verified |
|-------|------------|-------------|----------|
| (description) | (cause) | (fix) | ✅ |

## Common Pitfalls

1. **Missing RLS on new tables** - Always enable RLS when creating tenant-scoped tables
2. **Hardcoded tenant IDs** - Use dynamic lookup from session/context
3. **Direct database access** - Always use Supabase client with RLS
4. **Service key in client code** - Never expose service key; use anon key with RLS
5. **Missing foreign key constraints** - Ensure tenant_id references are enforced

## Related Documentation

- [DEVELOPMENT_STANDARDS.md](../../DEVELOPMENT_STANDARDS.md) - Section 7.5
- [white-label-testing-guide.md](../white-label-testing-guide.md)
