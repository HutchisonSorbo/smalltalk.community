-- This migration is idempotent and ensures ryanhutchison@outlook.com.au is an admin of the 'stc' tenant.
-- 1. Get the user ID and insert membership if missing
INSERT INTO tenant_members (tenant_id, user_id, role)
SELECT t.id,
    u.id,
    'admin'
FROM tenants t,
    users u
WHERE u.email = 'ryanhutchison@outlook.com.au'
    AND t.code = 'stc' ON CONFLICT (tenant_id, user_id) DO
UPDATE
SET role = 'admin'
WHERE tenant_members.role != 'admin';
-- 2. Verify all organisation users are members
INSERT INTO tenant_members (tenant_id, user_id, role)
SELECT t.id,
    u.id,
    'member'
FROM tenants t,
    users u
WHERE u.user_type = 'organisation'
    AND t.code = 'stc' ON CONFLICT (tenant_id, user_id) DO NOTHING;