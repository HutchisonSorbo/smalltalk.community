
import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function fixRLS() {
    console.log("🛡️ Fixing RLS Policies...");

    try {
        // --- Users Table ---
        console.log("Updating public.users policies...");
        await sql`ALTER TABLE public.users ENABLE ROW LEVEL SECURITY`;
        await sql`DROP POLICY IF EXISTS "users_self_read" ON public.users`;
        await sql`CREATE POLICY "users_self_read" ON public.users FOR SELECT TO authenticated USING (auth.uid()::text = id)`;

        await sql`DROP POLICY IF EXISTS "users_self_update" ON public.users`;
        await sql`CREATE POLICY "users_self_update" ON public.users FOR UPDATE TO authenticated USING (auth.uid()::text = id) WITH CHECK (auth.uid()::text = id)`;

        // --- User Apps Table ---
        console.log("Updating public.user_apps policies...");
        await sql`ALTER TABLE public.user_apps ENABLE ROW LEVEL SECURITY`;

        await sql`DROP POLICY IF EXISTS "user_apps_self_read" ON public.user_apps`;
        await sql`CREATE POLICY "user_apps_self_read" ON public.user_apps FOR SELECT TO authenticated USING (auth.uid()::text = user_id)`;

        await sql`DROP POLICY IF EXISTS "user_apps_self_insert" ON public.user_apps`;
        await sql`CREATE POLICY "user_apps_self_insert" ON public.user_apps FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id)`;

        await sql`DROP POLICY IF EXISTS "user_apps_self_delete" ON public.user_apps`;
        await sql`CREATE POLICY "user_apps_self_delete" ON public.user_apps FOR DELETE TO authenticated USING (auth.uid()::text = user_id)`;

        console.log("✅ RLS Policies updated successfully.");

    } catch (error) {
        console.error("❌ RLS Fix failed:", error);
    } finally {
        await sql.end();
    }
}

fixRLS();
