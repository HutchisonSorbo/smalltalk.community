/**
 * Utility script to apply the RLS fix migration
 */
import { config } from "dotenv";
config();
import { createServiceClient } from "../lib/supabase-service";
import fs from "fs";
import path from "path";

async function applyMigration() {
    console.log("🚀 Applying migration 0015_fix_public_tenant_rls.sql...");

    const supabase = createServiceClient();
    const migrationPath = path.join(process.cwd(), "migrations", "0015_fix_public_tenant_rls.sql");
    const sql = fs.readFileSync(migrationPath, "utf8");

    // Execute SQL as service role to bypass RLS and update policies
    const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql });

    if (error) {
        if (error.message.includes("function exec_sql") || error.message.includes("does not exist")) {
            console.log("⚠️  'exec_sql' RPC not found. Attempting direct execution via simple queries...");

            // Fallback: Split by semicolon if simple enough, or just run specific parts
            // In this case, let's try to run the main parts via Supabase client if possible
            // Actually, Supabase JS client doesn't support raw SQL easily without RPC.
            // We'll try to use a different approach if RPC fails.
            console.error("❌ Cannot apply raw SQL migration via Supabase client without 'exec_sql' RPC.");
            process.exit(1);
        }
        console.error("❌ Error applying migration:", error.message);
        process.exit(1);
    }

    console.log("✅ Migration applied successfully!");
}

applyMigration().catch(console.error);
