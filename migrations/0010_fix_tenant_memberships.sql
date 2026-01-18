-- CommunityOS Tenant Member Fix Migration
-- Adds missing tenant memberships for organisation accounts
-- 
-- This migration ensures that users with user_type = 'organisation' 
-- are automatically added as admins to the stc tenant.
-- Insert tenant membership for smalltalkcommunity.backup@gmail.com (main org account)
-- This creates an admin membership in the stc tenant
INSERT INTO tenant_members (id, tenant_id, user_id, role, joined_at)
SELECT gen_random_uuid()::text,
    'stc-00000000-0000-0000-0000-000000000001',
    -- The stc tenant ID from 0006 migration
    u.id,
    'admin',
    NOW()
FROM users u
WHERE u.email = 'smalltalkcommunity.backup@gmail.com' ON CONFLICT (tenant_id, user_id) DO NOTHING;
-- Also add any other organization accounts as admins 
-- (generalized for future org accounts)
INSERT INTO tenant_members (id, tenant_id, user_id, role, joined_at)
SELECT gen_random_uuid()::text,
    t.id,
    u.id,
    'admin',
    NOW()
FROM users u
    CROSS JOIN tenants t
WHERE u.user_type = 'organisation'
    AND t.code = 'stc' ON CONFLICT (tenant_id, user_id) DO NOTHING;
-- Log the affected users for debugging
DO $$
DECLARE affected_count INTEGER;
BEGIN
SELECT COUNT(*) INTO affected_count
FROM tenant_members tm
    JOIN users u ON tm.user_id = u.id
WHERE u.user_type = 'organisation'
    OR u.email = 'smalltalkcommunity.backup@gmail.com';
RAISE NOTICE 'Organisation accounts with tenant membership: %',
affected_count;
END $$;