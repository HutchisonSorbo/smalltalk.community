-- Migration: Fix RLS Security Issues
-- Date: 2026-01-07
-- Description: Enable RLS on tables and fix overly permissive policies
-- ============================================================
-- STEP 1: Enable RLS on tables that are missing it
-- ============================================================
-- Enable RLS on site_settings (ERROR level)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
-- Enable RLS on feature_flags (ERROR level)
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
-- ============================================================
-- STEP 2: Fix overly permissive policies
-- These policies use USING (true) which bypasses RLS
-- Recreate with proper ownership checks
-- ============================================================
-- Note: The Drizzle schema already has correct policies defined with
-- auth.uid()::text = userId checks. The issue is that these policies
-- differ from what's in the database.
-- Drop and recreate band_members policies
DROP POLICY IF EXISTS band_members_insert ON public.band_members;
DROP POLICY IF EXISTS band_members_update ON public.band_members;
DROP POLICY IF EXISTS band_members_delete ON public.band_members;
CREATE POLICY band_members_insert ON public.band_members FOR
INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY band_members_update ON public.band_members FOR
UPDATE TO authenticated USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY band_members_delete ON public.band_members FOR DELETE TO authenticated USING (auth.uid()::text = user_id);
-- Drop and recreate bands policies
DROP POLICY IF EXISTS bands_owner_insert ON public.bands;
DROP POLICY IF EXISTS bands_owner_update ON public.bands;
DROP POLICY IF EXISTS bands_owner_delete ON public.bands;
CREATE POLICY bands_owner_insert ON public.bands FOR
INSERT TO authenticated WITH CHECK (auth.uid()::text = owner_id);
CREATE POLICY bands_owner_update ON public.bands FOR
UPDATE TO authenticated USING (auth.uid()::text = owner_id) WITH CHECK (auth.uid()::text = owner_id);
CREATE POLICY bands_owner_delete ON public.bands FOR DELETE TO authenticated USING (auth.uid()::text = owner_id);
-- Drop and recreate classifieds policies
DROP POLICY IF EXISTS classifieds_owner_insert ON public.classifieds;
DROP POLICY IF EXISTS classifieds_owner_update ON public.classifieds;
DROP POLICY IF EXISTS classifieds_owner_delete ON public.classifieds;
CREATE POLICY classifieds_owner_insert ON public.classifieds FOR
INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY classifieds_owner_update ON public.classifieds FOR
UPDATE TO authenticated USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY classifieds_owner_delete ON public.classifieds FOR DELETE TO authenticated USING (auth.uid()::text = user_id);
-- Drop and recreate contact_requests policies
DROP POLICY IF EXISTS contact_requests_insert ON public.contact_requests;
DROP POLICY IF EXISTS contact_requests_update ON public.contact_requests;
CREATE POLICY contact_requests_insert ON public.contact_requests FOR
INSERT TO authenticated WITH CHECK (auth.uid()::text = sender_id);
CREATE POLICY contact_requests_update ON public.contact_requests FOR
UPDATE TO authenticated USING (
        auth.uid()::text = sender_id
        OR auth.uid()::text = recipient_id
    ) WITH CHECK (
        auth.uid()::text = sender_id
        OR auth.uid()::text = recipient_id
    );
-- Drop and recreate gig_managers policies
DROP POLICY IF EXISTS gig_managers_insert ON public.gig_managers;
DROP POLICY IF EXISTS gig_managers_update ON public.gig_managers;
DROP POLICY IF EXISTS gig_managers_delete ON public.gig_managers;
CREATE POLICY gig_managers_insert ON public.gig_managers FOR
INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY gig_managers_update ON public.gig_managers FOR
UPDATE TO authenticated USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY gig_managers_delete ON public.gig_managers FOR DELETE TO authenticated USING (auth.uid()::text = user_id);
-- Drop and recreate gigs policies
DROP POLICY IF EXISTS gigs_creator_insert ON public.gigs;
DROP POLICY IF EXISTS gigs_creator_update ON public.gigs;
DROP POLICY IF EXISTS gigs_creator_delete ON public.gigs;
CREATE POLICY gigs_creator_insert ON public.gigs FOR
INSERT TO authenticated WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY gigs_creator_update ON public.gigs FOR
UPDATE TO authenticated USING (auth.uid()::text = created_by) WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY gigs_creator_delete ON public.gigs FOR DELETE TO authenticated USING (auth.uid()::text = created_by);
-- Drop and recreate marketplace_listings policies
DROP POLICY IF EXISTS marketplace_owner_insert ON public.marketplace_listings;
DROP POLICY IF EXISTS marketplace_owner_update ON public.marketplace_listings;
DROP POLICY IF EXISTS marketplace_owner_delete ON public.marketplace_listings;
CREATE POLICY marketplace_owner_insert ON public.marketplace_listings FOR
INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY marketplace_owner_update ON public.marketplace_listings FOR
UPDATE TO authenticated USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY marketplace_owner_delete ON public.marketplace_listings FOR DELETE TO authenticated USING (auth.uid()::text = user_id);
-- Drop and recreate messages policies
DROP POLICY IF EXISTS messages_insert ON public.messages;
CREATE POLICY messages_insert ON public.messages FOR
INSERT TO authenticated WITH CHECK (auth.uid()::text = sender_id);
-- Drop and recreate musician_profiles policies
DROP POLICY IF EXISTS musicians_owner_insert ON public.musician_profiles;
DROP POLICY IF EXISTS musicians_owner_update ON public.musician_profiles;
DROP POLICY IF EXISTS musicians_owner_delete ON public.musician_profiles;
CREATE POLICY musicians_owner_insert ON public.musician_profiles FOR
INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY musicians_owner_update ON public.musician_profiles FOR
UPDATE TO authenticated USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY musicians_owner_delete ON public.musician_profiles FOR DELETE TO authenticated USING (auth.uid()::text = user_id);
-- Drop and recreate notifications policies
DROP POLICY IF EXISTS notifications_self_insert ON public.notifications;
DROP POLICY IF EXISTS notifications_self_update ON public.notifications;
DROP POLICY IF EXISTS notifications_self_delete ON public.notifications;
CREATE POLICY notifications_self_insert ON public.notifications FOR
INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY notifications_self_update ON public.notifications FOR
UPDATE TO authenticated USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY notifications_self_delete ON public.notifications FOR DELETE TO authenticated USING (auth.uid()::text = user_id);
-- Drop and recreate professional_profiles policies
DROP POLICY IF EXISTS pro_profiles_owner_insert ON public.professional_profiles;
DROP POLICY IF EXISTS pro_profiles_owner_update ON public.professional_profiles;
DROP POLICY IF EXISTS pro_profiles_owner_delete ON public.professional_profiles;
CREATE POLICY pro_profiles_owner_insert ON public.professional_profiles FOR
INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY pro_profiles_owner_update ON public.professional_profiles FOR
UPDATE TO authenticated USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY pro_profiles_owner_delete ON public.professional_profiles FOR DELETE TO authenticated USING (auth.uid()::text = user_id);
-- Drop and recreate reports policies
DROP POLICY IF EXISTS reports_insert ON public.reports;
CREATE POLICY reports_insert ON public.reports FOR
INSERT TO authenticated WITH CHECK (auth.uid()::text = reporter_id);
-- Drop and recreate reviews policies
DROP POLICY IF EXISTS reviews_owner_insert ON public.reviews;
DROP POLICY IF EXISTS reviews_owner_update ON public.reviews;
DROP POLICY IF EXISTS reviews_owner_delete ON public.reviews;
CREATE POLICY reviews_owner_insert ON public.reviews FOR
INSERT TO authenticated WITH CHECK (auth.uid()::text = reviewer_id);
CREATE POLICY reviews_owner_update ON public.reviews FOR
UPDATE TO authenticated USING (auth.uid()::text = reviewer_id) WITH CHECK (auth.uid()::text = reviewer_id);
CREATE POLICY reviews_owner_delete ON public.reviews FOR DELETE TO authenticated USING (auth.uid()::text = reviewer_id);
-- Drop and recreate volunteer_profiles policies
DROP POLICY IF EXISTS volunteer_profiles_owner_insert ON public.volunteer_profiles;
DROP POLICY IF EXISTS volunteer_profiles_owner_update ON public.volunteer_profiles;
DROP POLICY IF EXISTS volunteer_profiles_owner_delete ON public.volunteer_profiles;
CREATE POLICY volunteer_profiles_owner_insert ON public.volunteer_profiles FOR
INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY volunteer_profiles_owner_update ON public.volunteer_profiles FOR
UPDATE TO authenticated USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY volunteer_profiles_owner_delete ON public.volunteer_profiles FOR DELETE TO authenticated USING (auth.uid()::text = user_id);
-- Drop and recreate announcements policies (admin only for write)
DROP POLICY IF EXISTS announcements_admin_all ON public.announcements;
-- Announcements should only be writable by admins via service_role
-- The public_read policy is fine, but ALL access for authenticated is too broad
-- This requires admin check which RLS can't do directly, so use service_role only
CREATE POLICY announcements_service_write ON public.announcements FOR ALL TO service_role USING (true);
-- ============================================================
-- STEP 3: Add policies to tables with RLS enabled but no policies
-- ============================================================
-- apps table - public read, service_role write (already in schema)
CREATE POLICY IF NOT EXISTS apps_public_read ON public.apps FOR
SELECT TO public USING (true);
CREATE POLICY IF NOT EXISTS apps_admin_write ON public.apps FOR ALL TO service_role USING (true);
-- user_apps - users can only access their own app associations
CREATE POLICY IF NOT EXISTS user_apps_self_read ON public.user_apps FOR
SELECT TO authenticated USING (auth.uid()::text = user_id);
CREATE POLICY IF NOT EXISTS user_apps_self_insert ON public.user_apps FOR
INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY IF NOT EXISTS user_apps_self_delete ON public.user_apps FOR DELETE TO authenticated USING (auth.uid()::text = user_id);
-- user_notification_preferences - users can only access their own
-- Using FOR ALL covers SELECT, INSERT, UPDATE, DELETE
CREATE POLICY IF NOT EXISTS notification_prefs_self_all ON public.user_notification_preferences FOR ALL TO authenticated USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
-- user_onboarding_responses - users can only access their own
CREATE POLICY IF NOT EXISTS onboarding_responses_self_read ON public.user_onboarding_responses FOR
SELECT TO authenticated USING (auth.uid()::text = user_id);
CREATE POLICY IF NOT EXISTS onboarding_responses_self_insert ON public.user_onboarding_responses FOR
INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY IF NOT EXISTS onboarding_responses_self_update ON public.user_onboarding_responses FOR
UPDATE TO authenticated USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
-- user_privacy_settings - users can only access their own
-- Using FOR ALL covers SELECT, INSERT, UPDATE, DELETE
CREATE POLICY IF NOT EXISTS privacy_settings_self_all ON public.user_privacy_settings FOR ALL TO authenticated USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
-- user_recommended_apps - users can only access their own
-- Using FOR ALL covers SELECT, INSERT, UPDATE, DELETE
CREATE POLICY IF NOT EXISTS recommended_apps_self_all ON public.user_recommended_apps FOR ALL TO authenticated USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
-- onboarding_metrics - service_role only (admin metrics)
CREATE POLICY IF NOT EXISTS metrics_service_all ON public.onboarding_metrics FOR ALL TO service_role USING (true);
-- Payload CMS tables (cms_users, pages, media, etc.) - service_role only
-- These are managed by Payload CMS, not directly by users
CREATE POLICY IF NOT EXISTS cms_users_service_all ON public.cms_users FOR ALL TO service_role USING (true);
CREATE POLICY IF NOT EXISTS pages_service_all ON public.pages FOR ALL TO service_role USING (true);
CREATE POLICY IF NOT EXISTS media_service_all ON public.media FOR ALL TO service_role USING (true);
-- ============================================================
-- VERIFICATION
-- ============================================================
-- After running this migration, re-run the Supabase linter to verify
-- all ERROR and WARN level issues are resolved.