
import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function createUserAppsTable() {
    console.log("🔨 Creating user_apps table...");

    try {
        await sql`
            CREATE TABLE IF NOT EXISTS public.user_apps (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id VARCHAR NOT NULL REFERENCES public.users(id),
                app_id VARCHAR NOT NULL REFERENCES public.apps(id),
                is_pinned BOOLEAN DEFAULT false,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
            );
        `;

        // Indexes
        await sql`CREATE INDEX IF NOT EXISTS user_apps_user_idx ON public.user_apps (user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS user_apps_app_idx ON public.user_apps (app_id)`;
        await sql`CREATE UNIQUE INDEX IF NOT EXISTS user_apps_user_app_unique ON public.user_apps (user_id, app_id)`;

        console.log("✅ user_apps table created successfully.");

    } catch (error) {
        console.error("❌ Failed to create user_apps table:", error);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

createUserAppsTable();
