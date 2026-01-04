CREATE TABLE "admin_activity_log" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "admin_id" varchar NOT NULL,
    "action" varchar(100) NOT NULL,
    "target_type" varchar(50) NOT NULL,
    "target_id" varchar NOT NULL,
    "details" jsonb,
    "ip_address" varchar(45),
    "user_agent" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_activity_log" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE TABLE "feature_flags" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "key" varchar(100) NOT NULL,
    "name" varchar(255) NOT NULL,
    "description" text,
    "is_enabled" boolean DEFAULT false NOT NULL,
    "enabled_for_roles" text [] DEFAULT '{}'::text [],
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "feature_flags_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "feature_flags" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE TABLE "site_settings" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "key" varchar(100) NOT NULL,
    "value" jsonb NOT NULL,
    "description" text,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "updated_by" varchar,
    CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "site_settings" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "rate_limits"
ALTER COLUMN "user_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "users"
ALTER COLUMN "user_type"
SET DEFAULT 'individual';
--> statement-breakpoint
ALTER TABLE "rate_limits"
ADD COLUMN "identifier" varchar(255);
--> statement-breakpoint
ALTER TABLE "admin_activity_log"
ADD CONSTRAINT "admin_activity_log_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "site_settings"
ADD CONSTRAINT "site_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "admin_log_admin_idx" ON "admin_activity_log" USING btree ("admin_id");
--> statement-breakpoint
CREATE INDEX "admin_log_target_idx" ON "admin_activity_log" USING btree ("target_type", "target_id");
--> statement-breakpoint
CREATE INDEX "admin_log_created_idx" ON "admin_activity_log" USING btree ("created_at");
--> statement-breakpoint
CREATE UNIQUE INDEX "feature_flags_key_idx" ON "feature_flags" USING btree ("key");
--> statement-breakpoint
CREATE UNIQUE INDEX "site_settings_key_idx" ON "site_settings" USING btree ("key");
--> statement-breakpoint
CREATE INDEX "announcements_is_active_idx" ON "announcements" USING btree ("is_active");
--> statement-breakpoint
CREATE INDEX "rate_limits_identifier_v2_idx" ON "rate_limits" USING btree ("identifier");
--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "users_onboarding_completed_idx" ON "users" USING btree ("onboarding_completed");
--> statement-breakpoint
CREATE POLICY "admin_log_service_read" ON "admin_activity_log" AS PERMISSIVE FOR
SELECT TO "service_role" USING (true);
--> statement-breakpoint
CREATE POLICY "admin_log_service_write" ON "admin_activity_log" AS PERMISSIVE FOR
INSERT TO "service_role" WITH CHECK (true);
--> statement-breakpoint
CREATE POLICY "admin_log_authenticated_read" ON "admin_activity_log" AS PERMISSIVE FOR
SELECT TO "authenticated" USING (
        auth.jwt() ->> 'sub' IN (
            SELECT id
            FROM users
            WHERE is_admin = true
        )
    );
--> statement-breakpoint
CREATE POLICY "feature_flags_public_read" ON "feature_flags" AS PERMISSIVE FOR
SELECT TO public USING (true);
--> statement-breakpoint
CREATE POLICY "feature_flags_service_write" ON "feature_flags" AS PERMISSIVE FOR ALL TO "service_role" USING (true);
--> statement-breakpoint
CREATE POLICY "site_settings_public_read" ON "site_settings" AS PERMISSIVE FOR
SELECT TO public USING (true);
--> statement-breakpoint
CREATE POLICY "site_settings_service_write" ON "site_settings" AS PERMISSIVE FOR ALL TO "service_role" USING (true);
-->statement-breakpoint
ALTER TABLE "rate_limits"
ADD CONSTRAINT "rate_limits_user_or_identifier_check" CHECK (
        (
            user_id IS NOT NULL
            AND identifier IS NULL
        )
        OR (
            user_id IS NULL
            AND identifier IS NOT NULL
        )
    );