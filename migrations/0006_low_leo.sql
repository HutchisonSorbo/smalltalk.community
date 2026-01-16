CREATE TABLE "tenant_invites" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	"token" varchar(64) NOT NULL,
	"invited_by" varchar NOT NULL,
	"expires_at" timestamp DEFAULT NOW() + INTERVAL '7 days' NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "tenant_invites_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "tenant_invites" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tenant_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	"invited_by" varchar,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "tenant_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"logo_url" varchar(500),
	"primary_color" varchar(7) DEFAULT '#4F46E5',
	"secondary_color" varchar(7) DEFAULT '#818CF8',
	"description" text,
	"website" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tenants_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP INDEX "admin_log_created_idx";--> statement-breakpoint
DROP INDEX "apps_category_idx";--> statement-breakpoint
DROP INDEX "apps_is_active_idx";--> statement-breakpoint
ALTER TABLE "tenant_invites" ADD CONSTRAINT "tenant_invites_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_invites" ADD CONSTRAINT "tenant_invites_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_members" ADD CONSTRAINT "tenant_members_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_members" ADD CONSTRAINT "tenant_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_members" ADD CONSTRAINT "tenant_members_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_invites_token_idx" ON "tenant_invites" USING btree ("token");--> statement-breakpoint
CREATE INDEX "tenant_invites_email_idx" ON "tenant_invites" USING btree ("email");--> statement-breakpoint
CREATE INDEX "tenant_invites_tenant_id_idx" ON "tenant_invites" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tenant_invites_invited_by_idx" ON "tenant_invites" USING btree ("invited_by");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_members_tenant_user_idx" ON "tenant_members" USING btree ("tenant_id","user_id");--> statement-breakpoint
CREATE INDEX "tenant_members_tenant_id_idx" ON "tenant_members" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tenant_members_user_id_idx" ON "tenant_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tenant_members_invited_by_idx" ON "tenant_members" USING btree ("invited_by");--> statement-breakpoint
CREATE INDEX "site_settings_updated_by_idx" ON "site_settings" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "sys_user_roles_role_idx" ON "sys_user_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "idx_recommended_apps_app_id" ON "user_recommended_apps" USING btree ("app_id");--> statement-breakpoint
CREATE POLICY "tenant_invites_admin_all" ON "tenant_invites" AS PERMISSIVE FOR ALL TO "authenticated" USING (EXISTS (
      SELECT 1 FROM tenant_members tm
      WHERE tm.tenant_id = "tenant_invites"."tenant_id"
        AND tm.user_id = ( (select auth.uid()) )::text
        AND tm.role = 'admin'
    )) WITH CHECK (EXISTS (
      SELECT 1 FROM tenant_members tm
      WHERE tm.tenant_id = "tenant_invites"."tenant_id"
        AND tm.user_id = ( (select auth.uid()) )::text
        AND tm.role = 'admin'
    ));--> statement-breakpoint
CREATE POLICY "tenant_invites_service_all" ON "tenant_invites" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "tenant_members_self_read" ON "tenant_members" AS PERMISSIVE FOR SELECT TO "authenticated" USING (( (select auth.uid()) )::text = "tenant_members"."user_id");--> statement-breakpoint
CREATE POLICY "tenant_members_admin_read" ON "tenant_members" AS PERMISSIVE FOR SELECT TO "authenticated" USING (EXISTS (
      SELECT 1 FROM tenant_members tm
      WHERE tm.tenant_id = "tenant_members"."tenant_id"
        AND tm.user_id = ( (select auth.uid()) )::text
        AND tm.role = 'admin'
    ));--> statement-breakpoint
CREATE POLICY "tenant_members_service_all" ON "tenant_members" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "tenants_public_read" ON "tenants" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "tenants_service_write" ON "tenants" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
ALTER POLICY "admin_log_authenticated_read" ON "admin_activity_log" TO authenticated USING ((auth.uid())::text IN (SELECT id FROM users WHERE is_admin = true));--> statement-breakpoint
ALTER POLICY "announcements_admin_all" ON "announcements" TO authenticated USING (exists (
      select 1 from sys_user_roles ur 
      join sys_roles r on ur.role_id = r.id 
      where ur.user_id = ( (select auth.uid()) )::text
      and r.name in ('super_admin', 'admin')
    )) WITH CHECK (exists (
      select 1 from sys_user_roles ur 
      join sys_roles r on ur.role_id = r.id 
      where ur.user_id = ( (select auth.uid()) )::text
      and r.name in ('super_admin', 'admin')
    ));--> statement-breakpoint
ALTER POLICY "band_members_insert" ON "band_members" TO authenticated WITH CHECK (( (select auth.uid()) )::text = "band_members"."user_id");--> statement-breakpoint
ALTER POLICY "band_members_update" ON "band_members" TO authenticated USING (( (select auth.uid()) )::text = "band_members"."user_id") WITH CHECK (( (select auth.uid()) )::text = "band_members"."user_id");--> statement-breakpoint
ALTER POLICY "band_members_delete" ON "band_members" TO authenticated USING (( (select auth.uid()) )::text = "band_members"."user_id");--> statement-breakpoint
ALTER POLICY "bands_owner_insert" ON "bands" TO authenticated WITH CHECK (( (select auth.uid()) )::text = "bands"."user_id");--> statement-breakpoint
ALTER POLICY "bands_owner_update" ON "bands" TO authenticated USING (( (select auth.uid()) )::text = "bands"."user_id") WITH CHECK (( (select auth.uid()) )::text = "bands"."user_id");--> statement-breakpoint
ALTER POLICY "bands_owner_delete" ON "bands" TO authenticated USING (( (select auth.uid()) )::text = "bands"."user_id");--> statement-breakpoint
ALTER POLICY "classifieds_owner_insert" ON "classifieds" TO authenticated WITH CHECK ((auth.uid())::text = "classifieds"."user_id");--> statement-breakpoint
ALTER POLICY "classifieds_owner_update" ON "classifieds" TO authenticated USING ((auth.uid())::text = "classifieds"."user_id") WITH CHECK ((auth.uid())::text = "classifieds"."user_id");--> statement-breakpoint
ALTER POLICY "classifieds_owner_delete" ON "classifieds" TO authenticated USING ((auth.uid())::text = "classifieds"."user_id");--> statement-breakpoint
ALTER POLICY "contact_requests_read" ON "contact_requests" TO authenticated USING (( (select auth.uid()) )::text = "contact_requests"."requester_id" OR ( (select auth.uid()) )::text = "contact_requests"."recipient_id");--> statement-breakpoint
ALTER POLICY "contact_requests_insert" ON "contact_requests" TO authenticated WITH CHECK (( (select auth.uid()) )::text = "contact_requests"."requester_id");--> statement-breakpoint
ALTER POLICY "contact_requests_update" ON "contact_requests" TO authenticated USING (( (select auth.uid()) )::text = "contact_requests"."recipient_id" OR ( (select auth.uid()) )::text = "contact_requests"."requester_id");--> statement-breakpoint
ALTER POLICY "credentials_owner_read" ON "credentials" TO authenticated USING (( (select auth.uid()) )::text = (select user_id from volunteer_profiles where id = "credentials"."profile_id"));--> statement-breakpoint
ALTER POLICY "gig_managers_insert" ON "gig_managers" TO authenticated WITH CHECK (( (select auth.uid()) )::text = "gig_managers"."user_id");--> statement-breakpoint
ALTER POLICY "gig_managers_update" ON "gig_managers" TO authenticated USING (( (select auth.uid()) )::text = "gig_managers"."user_id") WITH CHECK (( (select auth.uid()) )::text = "gig_managers"."user_id");--> statement-breakpoint
ALTER POLICY "gig_managers_delete" ON "gig_managers" TO authenticated USING (( (select auth.uid()) )::text = "gig_managers"."user_id");--> statement-breakpoint
ALTER POLICY "gigs_creator_insert" ON "gigs" TO authenticated WITH CHECK (( (select auth.uid()) )::text = "gigs"."creator_id");--> statement-breakpoint
ALTER POLICY "gigs_creator_update" ON "gigs" TO authenticated USING (( (select auth.uid()) )::text = "gigs"."creator_id") WITH CHECK (( (select auth.uid()) )::text = "gigs"."creator_id");--> statement-breakpoint
ALTER POLICY "gigs_creator_delete" ON "gigs" TO authenticated USING (( (select auth.uid()) )::text = "gigs"."creator_id");--> statement-breakpoint
ALTER POLICY "marketplace_owner_insert" ON "marketplace_listings" TO authenticated WITH CHECK (( (select auth.uid()) )::text = "marketplace_listings"."user_id");--> statement-breakpoint
ALTER POLICY "marketplace_owner_update" ON "marketplace_listings" TO authenticated USING (( (select auth.uid()) )::text = "marketplace_listings"."user_id") WITH CHECK (( (select auth.uid()) )::text = "marketplace_listings"."user_id");--> statement-breakpoint
ALTER POLICY "marketplace_owner_delete" ON "marketplace_listings" TO authenticated USING (( (select auth.uid()) )::text = "marketplace_listings"."user_id");--> statement-breakpoint
ALTER POLICY "messages_read" ON "messages" TO authenticated USING ((auth.uid())::text = "messages"."sender_id" OR (auth.uid())::text = "messages"."receiver_id");--> statement-breakpoint
ALTER POLICY "messages_insert" ON "messages" TO authenticated WITH CHECK ((auth.uid())::text = "messages"."sender_id");--> statement-breakpoint
ALTER POLICY "musicians_owner_insert" ON "musician_profiles" TO authenticated WITH CHECK (( (select auth.uid()) )::text = "musician_profiles"."user_id");--> statement-breakpoint
ALTER POLICY "musicians_owner_update" ON "musician_profiles" TO authenticated USING (( (select auth.uid()) )::text = "musician_profiles"."user_id") WITH CHECK (( (select auth.uid()) )::text = "musician_profiles"."user_id");--> statement-breakpoint
ALTER POLICY "musicians_owner_delete" ON "musician_profiles" TO authenticated USING (( (select auth.uid()) )::text = "musician_profiles"."user_id");--> statement-breakpoint
ALTER POLICY "notifications_self_read" ON "notifications" TO authenticated USING (( (select auth.uid()) )::text = "notifications"."user_id");--> statement-breakpoint
ALTER POLICY "notifications_self_insert" ON "notifications" TO authenticated WITH CHECK (( (select auth.uid()) )::text = "notifications"."user_id");--> statement-breakpoint
ALTER POLICY "notifications_self_update" ON "notifications" TO authenticated USING (( (select auth.uid()) )::text = "notifications"."user_id") WITH CHECK (( (select auth.uid()) )::text = "notifications"."user_id");--> statement-breakpoint
ALTER POLICY "notifications_self_delete" ON "notifications" TO authenticated USING (( (select auth.uid()) )::text = "notifications"."user_id");--> statement-breakpoint
ALTER POLICY "pro_profiles_owner_insert" ON "professional_profiles" TO authenticated WITH CHECK ((auth.uid())::text = "professional_profiles"."user_id");--> statement-breakpoint
ALTER POLICY "pro_profiles_owner_update" ON "professional_profiles" TO authenticated USING ((auth.uid())::text = "professional_profiles"."user_id") WITH CHECK ((auth.uid())::text = "professional_profiles"."user_id");--> statement-breakpoint
ALTER POLICY "pro_profiles_owner_delete" ON "professional_profiles" TO authenticated USING ((auth.uid())::text = "professional_profiles"."user_id");--> statement-breakpoint
ALTER POLICY "reports_insert" ON "reports" TO authenticated WITH CHECK ((auth.uid())::text = "reports"."reporter_id");--> statement-breakpoint
ALTER POLICY "reviews_owner_insert" ON "reviews" TO authenticated WITH CHECK (( (select auth.uid()) )::text = "reviews"."reviewer_id");--> statement-breakpoint
ALTER POLICY "reviews_owner_update" ON "reviews" TO authenticated USING (( (select auth.uid()) )::text = "reviews"."reviewer_id") WITH CHECK (( (select auth.uid()) )::text = "reviews"."reviewer_id");--> statement-breakpoint
ALTER POLICY "reviews_owner_delete" ON "reviews" TO authenticated USING (( (select auth.uid()) )::text = "reviews"."reviewer_id");--> statement-breakpoint
ALTER POLICY "user_apps_self_read" ON "user_apps" TO authenticated USING (( (select auth.uid()) )::text = "user_apps"."user_id");--> statement-breakpoint
ALTER POLICY "user_apps_self_insert" ON "user_apps" TO authenticated WITH CHECK (( (select auth.uid()) )::text = "user_apps"."user_id");--> statement-breakpoint
ALTER POLICY "user_apps_self_delete" ON "user_apps" TO authenticated USING (( (select auth.uid()) )::text = "user_apps"."user_id");--> statement-breakpoint
ALTER POLICY "notification_prefs_self_read" ON "user_notification_preferences" TO authenticated USING (( (select auth.uid()) )::text = "user_notification_preferences"."user_id");--> statement-breakpoint
ALTER POLICY "notification_prefs_self_modify" ON "user_notification_preferences" TO authenticated USING (( (select auth.uid()) )::text = "user_notification_preferences"."user_id") WITH CHECK (( (select auth.uid()) )::text = "user_notification_preferences"."user_id");--> statement-breakpoint
ALTER POLICY "onboarding_responses_self_read" ON "user_onboarding_responses" TO authenticated USING (( (select auth.uid()) )::text = "user_onboarding_responses"."user_id");--> statement-breakpoint
ALTER POLICY "onboarding_responses_self_insert" ON "user_onboarding_responses" TO authenticated WITH CHECK (( (select auth.uid()) )::text = "user_onboarding_responses"."user_id");--> statement-breakpoint
ALTER POLICY "onboarding_responses_self_update" ON "user_onboarding_responses" TO authenticated USING (( (select auth.uid()) )::text = "user_onboarding_responses"."user_id") WITH CHECK (( (select auth.uid()) )::text = "user_onboarding_responses"."user_id");--> statement-breakpoint
ALTER POLICY "privacy_settings_self_read" ON "user_privacy_settings" TO authenticated USING (( (select auth.uid()) )::text = "user_privacy_settings"."user_id");--> statement-breakpoint
ALTER POLICY "privacy_settings_self_modify" ON "user_privacy_settings" TO authenticated USING (( (select auth.uid()) )::text = "user_privacy_settings"."user_id") WITH CHECK (( (select auth.uid()) )::text = "user_privacy_settings"."user_id");--> statement-breakpoint
ALTER POLICY "recommended_apps_self_read" ON "user_recommended_apps" TO authenticated USING (( (select auth.uid()) )::text = "user_recommended_apps"."user_id");--> statement-breakpoint
ALTER POLICY "recommended_apps_self_modify" ON "user_recommended_apps" TO authenticated USING (( (select auth.uid()) )::text = "user_recommended_apps"."user_id") WITH CHECK (( (select auth.uid()) )::text = "user_recommended_apps"."user_id");--> statement-breakpoint
ALTER POLICY "users_self_read" ON "users" TO authenticated USING (( (select auth.uid()) )::text = "users"."id");--> statement-breakpoint
ALTER POLICY "users_self_update" ON "users" TO authenticated USING (( (select auth.uid()) )::text = "users"."id" AND "users"."is_suspended" IS NOT TRUE) WITH CHECK (( (select auth.uid()) )::text = "users"."id" AND "users"."is_suspended" IS NOT TRUE);--> statement-breakpoint
ALTER POLICY "applications_applicant_read" ON "volunteer_applications" TO authenticated USING (( (select auth.uid()) )::text = (select user_id from volunteer_profiles where id = "volunteer_applications"."applicant_id"));--> statement-breakpoint
ALTER POLICY "volunteer_profiles_owner_insert" ON "volunteer_profiles" TO authenticated WITH CHECK (( (select auth.uid()) )::text = "volunteer_profiles"."user_id");--> statement-breakpoint
ALTER POLICY "volunteer_profiles_owner_update" ON "volunteer_profiles" TO authenticated USING (( (select auth.uid()) )::text = "volunteer_profiles"."user_id") WITH CHECK (( (select auth.uid()) )::text = "volunteer_profiles"."user_id");--> statement-breakpoint
ALTER POLICY "volunteer_profiles_owner_delete" ON "volunteer_profiles" TO authenticated USING (( (select auth.uid()) )::text = "volunteer_profiles"."user_id");