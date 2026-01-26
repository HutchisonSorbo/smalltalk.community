-- Migration 0016: Ensure backup account has admin access to stc tenant
-- This migration is idempotent - safe to run multiple times
-- Executed: 2026-01-26
-- 1. Upsert backup account as admin of 'stc' tenant
-- Uses ON CONFLICT to handle existing membership (upgrades to admin if needed)
INSERT INTO tenant_members (id, tenant_id, user_id, role, joined_at)
SELECT gen_random_uuid()::text,
    t.id,
    u.id,
    'admin',
    NOW()
FROM users u
    CROSS JOIN tenants t
WHERE u.email = 'smalltalkcommunity.backup@gmail.com'
    AND t.code = 'stc' ON CONFLICT (tenant_id, user_id) DO
UPDATE
SET role = 'admin'
WHERE tenant_members.role != 'admin';
-- 2. Verify insertion succeeded (returns the membership row)
-- SELECT tm.*, u.email, t.code
-- FROM tenant_members tm
-- JOIN users u ON tm.user_id = u.id
-- JOIN tenants t ON tm.tenant_id = t.id
-- WHERE u.email = 'smalltalkcommunity.backup@gmail.com'
--   AND t.code = 'stc';