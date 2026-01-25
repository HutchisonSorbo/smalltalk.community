/**
 * Debugging script for getPublicTenantByCode - Full Data Check
 */
import { config } from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env explicitly
config({ path: path.join(process.cwd(), ".env") });

async function debug() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
        process.exit(1);
    }

    const supabase = createClient(url, key);

    console.log("🔍 Fetching FULL data for 'stc' tenant...");
    const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("code", "stc")
        .single();

    if (error) {
        console.error("❌ Error:", error);
    } else {
        console.log("✅ Result:");
        console.log(JSON.stringify(data, null, 2));
    }
}

debug().catch(console.error);
