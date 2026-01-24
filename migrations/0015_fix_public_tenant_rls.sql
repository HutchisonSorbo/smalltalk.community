-- Migration: Fix Public Tenant RLS and STC Visibility
-- Description: Ensures the 'stc' tenant is public and the RLS policy allows unauthenticated access.
-- Date: 2026-01-24
-- 1. Ensure 'stc' tenant is public (backup to seed script)
UPDATE tenants
SET is_public = true
WHERE code = 'stc'
    AND (
        is_public IS NULL
        OR is_public = false
    );
-- 2. Drop existing public read policy if it exists to ensure clean state
DROP POLICY IF EXISTS "tenants_public_read" ON tenants;
-- 3. Create explicit public read policy that allows ONLY is_public = true rows
-- We use TO public which includes both authenticated and unauthenticated users
CREATE POLICY "tenants_public_read" ON tenants FOR
SELECT TO public USING (is_public = true);
-- 4. Enable RLS (idempotent)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
-- 5. Add comment for documentation
COMMENT ON TABLE tenants IS 'Organisations/Tenants - RLS allows public restricted access to is_public=true profiles';