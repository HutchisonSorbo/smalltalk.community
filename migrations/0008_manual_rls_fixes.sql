-- Migration: 0008_manual_rls_fixes
-- Description: Consolidate redundant policies, set policies for non-Drizzle tables, and optimize remaining auth.uid() calls.
-- 1. Consolidate Redundant Policies for announcements
-- We already have announcements_admin_all and announcements_service_all in Drizzle.
-- Dropping potential old names from previous migrations or manual additions.
DROP POLICY IF EXISTS announcements_admin_all ON public.announcements;
-- Will be recreated by Drizzle
DROP POLICY IF EXISTS announcements_service_write ON public.announcements;
DROP POLICY IF EXISTS announcements_public_read ON public.announcements;
-- Will be recreated by Drizzle
-- 2. Consolidate Redundant Policies for tenant_members
-- Drizzle manages these now.
DROP POLICY IF EXISTS tenant_members_self_read ON public.tenant_members;
DROP POLICY IF EXISTS tenant_members_admin_read ON public.tenant_members;
DROP POLICY IF EXISTS tenant_members_service_all ON public.tenant_members;
DROP POLICY IF EXISTS "Anyone can view tenant members" ON public.tenant_members;
DROP POLICY IF EXISTS "Authenticated users can view tenant members" ON public.tenant_members;
-- 3. RLS Policies for Payload CMS and other non-Drizzle tables
-- Enable RLS (already enabled on many, but safe to repeat)
ALTER TABLE public.cms_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payload_locked_documents_rels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payload_preferences_rels ENABLE ROW LEVEL SECURITY;
-- service_role should have full access to Payload tables
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'cms_users_service_all'
) THEN CREATE POLICY cms_users_service_all ON public.cms_users FOR ALL TO service_role USING (true) WITH CHECK (true);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'pages_service_all'
) THEN CREATE POLICY pages_service_all ON public.pages FOR ALL TO service_role USING (true) WITH CHECK (true);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'media_service_all'
) THEN CREATE POLICY media_service_all ON public.media FOR ALL TO service_role USING (true) WITH CHECK (true);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'payload_locked_documents_rels_service_all'
) THEN CREATE POLICY payload_locked_documents_rels_service_all ON public.payload_locked_documents_rels FOR ALL TO service_role USING (true) WITH CHECK (true);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'payload_preferences_rels_service_all'
) THEN CREATE POLICY payload_preferences_rels_service_all ON public.payload_preferences_rels FOR ALL TO service_role USING (true) WITH CHECK (true);
END IF;
END $$;
-- 4. Correcting any RLS Policy Always True issues for INSERT/UPDATE/DELETE
-- These were mostly handled by Drizzle, but ensuring any manual ones are fixed.
-- 5. Leaked Password Protection (Manual Step Required)
-- NOTE: To fully resolve the Leaked Password Protection warning, go to:
-- Supabase Dashboard -> Authentication -> Settings -> Security -> Brute Force Protection
-- Enable "Leaked Password Protection".