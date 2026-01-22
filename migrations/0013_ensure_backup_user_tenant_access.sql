-- Migration 0013: Ensure backup user and organization users have tenant access
-- This migration is idempotent and ensures Smalltalk Community admins have access to the 'stc' tenant.
-- 1. Ensure smalltalkcommunity.backup@gmail.com is an admin of 'stc'
INSERT INTO tenant_members (id, tenant_id, user_id, role, joined_at)
SELECT gen_random_uuid()::text,
    t.id,
    u.id,
    'admin',
    NOW()
FROM users u
    CROSS JOIN tenants t
WHERE u.email = 'smalltalkcommunity.backup@gmail.com'
    AND t.code = 'stc' ON CONFLICT (tenant_id, user_id) DO NOTHING;
-- 2. Ensure all users with user_type = 'organisation' are added as members of 'stc'
-- This ensures they see the CommunityOS link on their dashboard without being full admins.
INSERT INTO tenant_members (id, tenant_id, user_id, role, joined_at)
SELECT gen_random_uuid()::text,
    t.id,
    u.id,
    'member',
    NOW()
FROM users u
    CROSS JOIN tenants t
WHERE u.user_type = 'organisation'
    AND t.code = 'stc' ON CONFLICT (tenant_id, user_id) DO NOTHING;
-- 3. Update the description of the 'stc' tenant to mention it is the public hub (optional but helpful)
UPDATE tenants
SET description = 'Smalltalk Community Global Hub - Connect with local organizations and communities.'
WHERE code = 'stc'
    AND description IS NULL;