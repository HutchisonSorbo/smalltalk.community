CREATE TABLE "apps" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"icon_url" varchar(255) NOT NULL,
	"route" varchar(100),
	"category" varchar(50),
	"age_restriction" text,
	"suitable_for_account_types" text[],
	"relevant_interests" text[],
	"relevant_intents" text[],
	"is_beta" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "apps" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "onboarding_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metric_date" text NOT NULL,
	"metric_name" text NOT NULL,
	"account_type" text,
	"age_group" text,
	"metric_value" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "onboarding_metrics" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_apps" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"app_id" varchar NOT NULL,
	"position" integer,
	"is_pinned" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_apps" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_notification_preferences" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"email_weekly_digest" boolean DEFAULT true,
	"email_event_reminders" boolean DEFAULT true,
	"email_messages" boolean DEFAULT true,
	"email_recommendations" boolean DEFAULT true,
	"email_newsletter" boolean DEFAULT true,
	"push_enabled" boolean DEFAULT false,
	"sound_enabled" boolean DEFAULT true,
	"preferences_updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_notification_preferences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_onboarding_responses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"question_key" text NOT NULL,
	"response" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_onboarding_responses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_privacy_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"profile_visibility" text DEFAULT 'community_members',
	"show_real_name" boolean DEFAULT false,
	"show_location" boolean DEFAULT true,
	"show_age" boolean DEFAULT true,
	"allow_email_lookup" boolean DEFAULT false,
	"default_post_visibility" text DEFAULT 'community',
	"settings_updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_privacy_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_recommended_apps" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"app_id" varchar NOT NULL,
	"recommendation_score" integer,
	"shown_at" timestamp DEFAULT now(),
	"accepted" boolean DEFAULT false,
	"accepted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "user_recommended_apps" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "wwcc_number" varchar(50);--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "wwcc_surname" varchar(100);--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "wwcc_expiry" timestamp;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "wwcc_status" varchar(20) DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "wwcc_validated_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_type" varchar(100) DEFAULT 'Individual';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_type_specification" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "organisation_name" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_minor" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "message_privacy" varchar(20) DEFAULT 'everyone';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_step" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_completion_percentage" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_apps" ADD CONSTRAINT "user_apps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_apps" ADD CONSTRAINT "user_apps_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_onboarding_responses" ADD CONSTRAINT "user_onboarding_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_privacy_settings" ADD CONSTRAINT "user_privacy_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_recommended_apps" ADD CONSTRAINT "user_recommended_apps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_recommended_apps" ADD CONSTRAINT "user_recommended_apps_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_metrics_date" ON "onboarding_metrics" USING btree ("metric_date");--> statement-breakpoint
CREATE INDEX "user_apps_user_idx" ON "user_apps" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_apps_app_idx" ON "user_apps" USING btree ("app_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_apps_user_app_unique" ON "user_apps" USING btree ("user_id","app_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_notification_prefs_user" ON "user_notification_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_onboarding_user_id" ON "user_onboarding_responses" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_privacy_settings_user" ON "user_privacy_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_recommended_apps_user_id" ON "user_recommended_apps" USING btree ("user_id");--> statement-breakpoint
CREATE POLICY "apps_public_read" ON "apps" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "apps_admin_write" ON "apps" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "metrics_service_all" ON "onboarding_metrics" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "user_apps_self_read" ON "user_apps" AS PERMISSIVE FOR SELECT TO "authenticated" USING (auth.uid()::text = "user_apps"."user_id");--> statement-breakpoint
CREATE POLICY "user_apps_self_insert" ON "user_apps" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (auth.uid()::text = "user_apps"."user_id");--> statement-breakpoint
CREATE POLICY "user_apps_self_delete" ON "user_apps" AS PERMISSIVE FOR DELETE TO "authenticated" USING (auth.uid()::text = "user_apps"."user_id");--> statement-breakpoint
CREATE POLICY "notification_prefs_self_read" ON "user_notification_preferences" AS PERMISSIVE FOR SELECT TO "authenticated" USING (auth.uid()::text = "user_notification_preferences"."user_id");--> statement-breakpoint
CREATE POLICY "notification_prefs_self_modify" ON "user_notification_preferences" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid()::text = "user_notification_preferences"."user_id") WITH CHECK (auth.uid()::text = "user_notification_preferences"."user_id");--> statement-breakpoint
CREATE POLICY "onboarding_responses_self_read" ON "user_onboarding_responses" AS PERMISSIVE FOR SELECT TO "authenticated" USING (auth.uid()::text = "user_onboarding_responses"."user_id");--> statement-breakpoint
CREATE POLICY "onboarding_responses_self_insert" ON "user_onboarding_responses" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (auth.uid()::text = "user_onboarding_responses"."user_id");--> statement-breakpoint
CREATE POLICY "onboarding_responses_self_update" ON "user_onboarding_responses" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (auth.uid()::text = "user_onboarding_responses"."user_id") WITH CHECK (auth.uid()::text = "user_onboarding_responses"."user_id");--> statement-breakpoint
CREATE POLICY "privacy_settings_self_read" ON "user_privacy_settings" AS PERMISSIVE FOR SELECT TO "authenticated" USING (auth.uid()::text = "user_privacy_settings"."user_id");--> statement-breakpoint
CREATE POLICY "privacy_settings_self_modify" ON "user_privacy_settings" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid()::text = "user_privacy_settings"."user_id") WITH CHECK (auth.uid()::text = "user_privacy_settings"."user_id");--> statement-breakpoint
CREATE POLICY "recommended_apps_self_read" ON "user_recommended_apps" AS PERMISSIVE FOR SELECT TO "authenticated" USING (auth.uid()::text = "user_recommended_apps"."user_id");--> statement-breakpoint
CREATE POLICY "recommended_apps_self_modify" ON "user_recommended_apps" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid()::text = "user_recommended_apps"."user_id") WITH CHECK (auth.uid()::text = "user_recommended_apps"."user_id");--> statement-breakpoint
ALTER POLICY "announcements_admin_all" ON "announcements" TO authenticated USING (exists (
      select 1 from sys_user_roles ur 
      join sys_roles r on ur.role_id = r.id 
      where ur.user_id = auth.uid()::text 
      and r.name in ('super_admin', 'admin')
    ));--> statement-breakpoint
ALTER POLICY "band_members_insert" ON "band_members" TO authenticated WITH CHECK (auth.uid()::text = "band_members"."user_id");--> statement-breakpoint
ALTER POLICY "band_members_update" ON "band_members" TO authenticated USING (auth.uid()::text = "band_members"."user_id") WITH CHECK (auth.uid()::text = "band_members"."user_id");--> statement-breakpoint
ALTER POLICY "band_members_delete" ON "band_members" TO authenticated USING (auth.uid()::text = "band_members"."user_id");--> statement-breakpoint
ALTER POLICY "bands_owner_insert" ON "bands" TO authenticated WITH CHECK (auth.uid()::text = "bands"."user_id");--> statement-breakpoint
ALTER POLICY "bands_owner_update" ON "bands" TO authenticated USING (auth.uid()::text = "bands"."user_id") WITH CHECK (auth.uid()::text = "bands"."user_id");--> statement-breakpoint
ALTER POLICY "bands_owner_delete" ON "bands" TO authenticated USING (auth.uid()::text = "bands"."user_id");--> statement-breakpoint
ALTER POLICY "classifieds_owner_insert" ON "classifieds" TO authenticated WITH CHECK (auth.uid()::text = "classifieds"."user_id");--> statement-breakpoint
ALTER POLICY "classifieds_owner_update" ON "classifieds" TO authenticated USING (auth.uid()::text = "classifieds"."user_id") WITH CHECK (auth.uid()::text = "classifieds"."user_id");--> statement-breakpoint
ALTER POLICY "classifieds_owner_delete" ON "classifieds" TO authenticated USING (auth.uid()::text = "classifieds"."user_id");--> statement-breakpoint
ALTER POLICY "contact_requests_read" ON "contact_requests" TO authenticated USING (auth.uid()::text = "contact_requests"."requester_id" OR auth.uid()::text = "contact_requests"."recipient_id");--> statement-breakpoint
ALTER POLICY "contact_requests_insert" ON "contact_requests" TO authenticated WITH CHECK (auth.uid()::text = "contact_requests"."requester_id");--> statement-breakpoint
ALTER POLICY "contact_requests_update" ON "contact_requests" TO authenticated USING (auth.uid()::text = "contact_requests"."recipient_id" OR auth.uid()::text = "contact_requests"."requester_id");--> statement-breakpoint
ALTER POLICY "credentials_owner_read" ON "credentials" TO authenticated USING (auth.uid()::text = (select user_id from volunteer_profiles where id = "credentials"."profile_id"));--> statement-breakpoint
ALTER POLICY "gig_managers_insert" ON "gig_managers" TO authenticated WITH CHECK (auth.uid()::text = "gig_managers"."user_id");--> statement-breakpoint
ALTER POLICY "gig_managers_update" ON "gig_managers" TO authenticated USING (auth.uid()::text = "gig_managers"."user_id") WITH CHECK (auth.uid()::text = "gig_managers"."user_id");--> statement-breakpoint
ALTER POLICY "gig_managers_delete" ON "gig_managers" TO authenticated USING (auth.uid()::text = "gig_managers"."user_id");--> statement-breakpoint
ALTER POLICY "gigs_creator_insert" ON "gigs" TO authenticated WITH CHECK (auth.uid()::text = "gigs"."creator_id");--> statement-breakpoint
ALTER POLICY "gigs_creator_update" ON "gigs" TO authenticated USING (auth.uid()::text = "gigs"."creator_id") WITH CHECK (auth.uid()::text = "gigs"."creator_id");--> statement-breakpoint
ALTER POLICY "gigs_creator_delete" ON "gigs" TO authenticated USING (auth.uid()::text = "gigs"."creator_id");--> statement-breakpoint
ALTER POLICY "marketplace_owner_insert" ON "marketplace_listings" TO authenticated WITH CHECK (auth.uid()::text = "marketplace_listings"."user_id");--> statement-breakpoint
ALTER POLICY "marketplace_owner_update" ON "marketplace_listings" TO authenticated USING (auth.uid()::text = "marketplace_listings"."user_id") WITH CHECK (auth.uid()::text = "marketplace_listings"."user_id");--> statement-breakpoint
ALTER POLICY "marketplace_owner_delete" ON "marketplace_listings" TO authenticated USING (auth.uid()::text = "marketplace_listings"."user_id");--> statement-breakpoint
ALTER POLICY "messages_read" ON "messages" TO authenticated USING (auth.uid()::text = "messages"."sender_id" OR auth.uid()::text = "messages"."receiver_id");--> statement-breakpoint
ALTER POLICY "messages_insert" ON "messages" TO authenticated WITH CHECK (auth.uid()::text = "messages"."sender_id");--> statement-breakpoint
ALTER POLICY "musicians_owner_insert" ON "musician_profiles" TO authenticated WITH CHECK (auth.uid()::text = "musician_profiles"."user_id");--> statement-breakpoint
ALTER POLICY "musicians_owner_update" ON "musician_profiles" TO authenticated USING (auth.uid()::text = "musician_profiles"."user_id") WITH CHECK (auth.uid()::text = "musician_profiles"."user_id");--> statement-breakpoint
ALTER POLICY "musicians_owner_delete" ON "musician_profiles" TO authenticated USING (auth.uid()::text = "musician_profiles"."user_id");--> statement-breakpoint
ALTER POLICY "notifications_self_read" ON "notifications" TO authenticated USING (auth.uid()::text = "notifications"."user_id");--> statement-breakpoint
ALTER POLICY "notifications_self_insert" ON "notifications" TO authenticated WITH CHECK (auth.uid()::text = "notifications"."user_id");--> statement-breakpoint
ALTER POLICY "notifications_self_update" ON "notifications" TO authenticated USING (auth.uid()::text = "notifications"."user_id") WITH CHECK (auth.uid()::text = "notifications"."user_id");--> statement-breakpoint
ALTER POLICY "notifications_self_delete" ON "notifications" TO authenticated USING (auth.uid()::text = "notifications"."user_id");--> statement-breakpoint
ALTER POLICY "pro_profiles_owner_insert" ON "professional_profiles" TO authenticated WITH CHECK (auth.uid()::text = "professional_profiles"."user_id");--> statement-breakpoint
ALTER POLICY "pro_profiles_owner_update" ON "professional_profiles" TO authenticated USING (auth.uid()::text = "professional_profiles"."user_id") WITH CHECK (auth.uid()::text = "professional_profiles"."user_id");--> statement-breakpoint
ALTER POLICY "reports_insert" ON "reports" TO authenticated WITH CHECK (auth.uid()::text = "reports"."reporter_id");--> statement-breakpoint
ALTER POLICY "reviews_owner_insert" ON "reviews" TO authenticated WITH CHECK (auth.uid()::text = "reviews"."reviewer_id");--> statement-breakpoint
ALTER POLICY "reviews_owner_update" ON "reviews" TO authenticated USING (auth.uid()::text = "reviews"."reviewer_id") WITH CHECK (auth.uid()::text = "reviews"."reviewer_id");--> statement-breakpoint
ALTER POLICY "reviews_owner_delete" ON "reviews" TO authenticated USING (auth.uid()::text = "reviews"."reviewer_id");--> statement-breakpoint
ALTER POLICY "users_self_read" ON "users" TO authenticated USING (auth.uid()::text::text = "users"."id");--> statement-breakpoint
ALTER POLICY "users_self_update" ON "users" TO authenticated USING (auth.uid()::text::text = "users"."id") WITH CHECK (auth.uid()::text::text = "users"."id");--> statement-breakpoint
ALTER POLICY "applications_applicant_read" ON "volunteer_applications" TO authenticated USING (auth.uid()::text = (select user_id from volunteer_profiles where id = "volunteer_applications"."applicant_id"));--> statement-breakpoint
ALTER POLICY "volunteer_profiles_owner_insert" ON "volunteer_profiles" TO authenticated WITH CHECK (auth.uid()::text = "volunteer_profiles"."user_id");--> statement-breakpoint
ALTER POLICY "volunteer_profiles_owner_update" ON "volunteer_profiles" TO authenticated USING (auth.uid()::text = "volunteer_profiles"."user_id") WITH CHECK (auth.uid()::text = "volunteer_profiles"."user_id");