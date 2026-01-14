-- 1. Enable RLS for missing tables
ALTER TABLE "site_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "feature_flags" ENABLE ROW LEVEL SECURITY;
-- 2. Optimize Auth RLS Initialization (Wrap auth.uid in subquery)
-- and Harden "Always True" policies
-- Users Table
DROP POLICY IF EXISTS "users_self_read" ON "users";
CREATE POLICY "users_self_read" ON "users" FOR
SELECT TO authenticated USING (
        (
            SELECT auth.uid()::text
        ) = "id"
    );
DROP POLICY IF EXISTS "users_self_update" ON "users";
CREATE POLICY "users_self_update" ON "users" FOR
UPDATE TO authenticated USING (
        (
            SELECT auth.uid()::text
        ) = "id"
        AND "is_suspended" IS NOT TRUE
    ) WITH CHECK (
        (
            SELECT auth.uid()::text
        ) = "id"
        AND "is_suspended" IS NOT TRUE
    );
-- Musician Profiles
DROP POLICY IF EXISTS "musicians_owner_insert" ON "musician_profiles";
CREATE POLICY "musicians_owner_insert" ON "musician_profiles" FOR
INSERT TO authenticated WITH CHECK (
        (
            SELECT auth.uid()::text
        ) = "user_id"
    );
DROP POLICY IF EXISTS "musicians_owner_update" ON "musician_profiles";
CREATE POLICY "musicians_owner_update" ON "musician_profiles" FOR
UPDATE TO authenticated USING (
        (
            SELECT auth.uid()::text
        ) = "user_id"
    ) WITH CHECK (
        (
            SELECT auth.uid()::text
        ) = "user_id"
    );
DROP POLICY IF EXISTS "musicians_owner_delete" ON "musician_profiles";
CREATE POLICY "musicians_owner_delete" ON "musician_profiles" FOR DELETE TO authenticated USING (
    (
        SELECT auth.uid()::text
    ) = "user_id"
);
-- Marketplace Listings
DROP POLICY IF EXISTS "marketplace_owner_insert" ON "marketplace_listings";
CREATE POLICY "marketplace_owner_insert" ON "marketplace_listings" FOR
INSERT TO authenticated WITH CHECK (
        (
            SELECT auth.uid()::text
        ) = "user_id"
    );
DROP POLICY IF EXISTS "marketplace_owner_update" ON "marketplace_listings";
CREATE POLICY "marketplace_owner_update" ON "marketplace_listings" FOR
UPDATE TO authenticated USING (
        (
            SELECT auth.uid()::text
        ) = "user_id"
    ) WITH CHECK (
        (
            SELECT auth.uid()::text
        ) = "user_id"
    );
DROP POLICY IF EXISTS "marketplace_owner_delete" ON "marketplace_listings";
CREATE POLICY "marketplace_owner_delete" ON "marketplace_listings" FOR DELETE TO authenticated USING (
    (
        SELECT auth.uid()::text
    ) = "user_id"
);
-- Bands
DROP POLICY IF EXISTS "bands_owner_insert" ON "bands";
CREATE POLICY "bands_owner_insert" ON "bands" FOR
INSERT TO authenticated WITH CHECK (
        (
            SELECT auth.uid()::text
        ) = "user_id"
    );
DROP POLICY IF EXISTS "bands_owner_update" ON "bands";
CREATE POLICY "bands_owner_update" ON "bands" FOR
UPDATE TO authenticated USING (
        (
            SELECT auth.uid()::text
        ) = "user_id"
    ) WITH CHECK (
        (
            SELECT auth.uid()::text
        ) = "user_id"
    );
DROP POLICY IF EXISTS "bands_owner_delete" ON "bands";
CREATE POLICY "bands_owner_delete" ON "bands" FOR DELETE TO authenticated USING (
    (
        SELECT auth.uid()::text
    ) = "user_id"
);
-- Gigs
DROP POLICY IF EXISTS "gigs_creator_insert" ON "gigs";
CREATE POLICY "gigs_creator_insert" ON "gigs" FOR
INSERT TO authenticated WITH CHECK (
        (
            SELECT auth.uid()::text
        ) = "creator_id"
    );
DROP POLICY IF EXISTS "gigs_creator_update" ON "gigs";
CREATE POLICY "gigs_creator_update" ON "gigs" FOR
UPDATE TO authenticated USING (
        (
            SELECT auth.uid()::text
        ) = "creator_id"
    ) WITH CHECK (
        (
            SELECT auth.uid()::text
        ) = "creator_id"
    );
DROP POLICY IF EXISTS "gigs_creator_delete" ON "gigs";
CREATE POLICY "gigs_creator_delete" ON "gigs" FOR DELETE TO authenticated USING (
    (
        SELECT auth.uid()::text
    ) = "creator_id"
);
-- Lockdown Payload CMS tables (service_role only)
ALTER TABLE "payload_kv" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payload_kv_admin_all" ON "payload_kv";
CREATE POLICY "payload_kv_admin_all" ON "payload_kv" FOR ALL TO service_role USING (true);
ALTER TABLE "payload_locked_documents" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payload_locked_docs_admin_all" ON "payload_locked_documents";
CREATE POLICY "payload_locked_docs_admin_all" ON "payload_locked_documents" FOR ALL TO service_role USING (true);
ALTER TABLE "payload_migrations" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payload_migrations_admin_all" ON "payload_migrations";
CREATE POLICY "payload_migrations_admin_all" ON "payload_migrations" FOR ALL TO service_role USING (true);
ALTER TABLE "payload_preferences" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payload_preferences_admin_all" ON "payload_preferences";
CREATE POLICY "payload_preferences_admin_all" ON "payload_preferences" FOR ALL TO service_role USING (true);