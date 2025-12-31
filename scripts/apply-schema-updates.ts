import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function applyUpdates() {
    try {
        console.log("Applying manual schema updates...");

        // Update users table
        await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS profile_completion_percentage integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamp,
      ADD COLUMN IF NOT EXISTS account_type_specification varchar(255),
      ADD COLUMN IF NOT EXISTS is_minor boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS message_privacy varchar(20) DEFAULT 'everyone',
      ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS organisation_name varchar(255); -- listed as present but good to ensure
    `);
        console.log("Updated users table.");

        // Create apps table if not exists (dropped already, but safe to check)
        // Note: using raw SQL matching schema roughly
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS apps (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(100) NOT NULL,
        description text NOT NULL,
        icon_url varchar(255) NOT NULL,
        route varchar(100),
        category varchar(50),
        age_restriction text,
        suitable_for_account_types text[],
        relevant_interests text[],
        relevant_intents text[],
        is_beta boolean DEFAULT false,
        is_active boolean DEFAULT true,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      );
    `);

        // Enable RLS on apps
        await db.execute(sql`ALTER TABLE apps ENABLE ROW LEVEL SECURITY;`);
        // Create policies for apps (if not exists checks are hard in raw sql for policies, but `db:push` might fix them)
        // We'll let `db:push` handle policies if possible, or just ignore.


        // Create user_apps
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_apps (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        app_id varchar NOT NULL REFERENCES apps(id),
        position integer,
        is_pinned boolean DEFAULT false,
        created_at timestamp DEFAULT now()
      );
    `);
        await db.execute(sql`ALTER TABLE user_apps ENABLE ROW LEVEL SECURITY;`);

        // Create other new tables needed
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_onboarding_responses (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        question_key text NOT NULL,
        response jsonb NOT NULL,
        created_at timestamp DEFAULT now()
      );
    `);
        await db.execute(sql`ALTER TABLE user_onboarding_responses ENABLE ROW LEVEL SECURITY;`);

        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_privacy_settings (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        profile_visibility text DEFAULT 'community_members',
        show_real_name boolean DEFAULT false,
        show_location boolean DEFAULT true,
        show_age boolean DEFAULT true,
        allow_email_lookup boolean DEFAULT false,
        default_post_visibility text DEFAULT 'community',
        settings_updated_at timestamp DEFAULT now(),
        created_at timestamp DEFAULT now()
      );
    `);
        await db.execute(sql`ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;`);

        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_notification_preferences (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        email_weekly_digest boolean DEFAULT true,
        email_event_reminders boolean DEFAULT true,
        email_messages boolean DEFAULT true,
        email_recommendations boolean DEFAULT true,
        email_newsletter boolean DEFAULT true,
        push_enabled boolean DEFAULT false,
        sound_enabled boolean DEFAULT true,
        preferences_updated_at timestamp DEFAULT now(),
        created_at timestamp DEFAULT now()
      );
    `);
        await db.execute(sql`ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;`);

        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_recommended_apps (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        app_id varchar NOT NULL REFERENCES apps(id),
        recommendation_score integer,
        shown_at timestamp DEFAULT now(),
        accepted boolean DEFAULT false,
        accepted_at timestamp
      );
    `);
        await db.execute(sql`ALTER TABLE user_recommended_apps ENABLE ROW LEVEL SECURITY;`);

        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS onboarding_metrics (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        metric_date text NOT NULL,
        metric_name text NOT NULL,
        account_type text,
        age_group text,
        metric_value integer,
        created_at timestamp DEFAULT now()
      );
    `);
        await db.execute(sql`ALTER TABLE onboarding_metrics ENABLE ROW LEVEL SECURITY;`);

        console.log("Manual updates complete.");

    } catch (e) {
        console.error("Manual update failed:", e);
        process.exit(1);
    }
    process.exit(0);
}
applyUpdates();
