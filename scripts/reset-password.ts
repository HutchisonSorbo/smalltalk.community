import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import { db } from "../server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
        console.error("Usage: npx tsx scripts/reset-password.ts <email> <password>");
        process.exit(1);
    }

    console.log(`Resetting password for ${email}...`);

    // 1. Find user ID from email in public.users
    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!user) {
        console.error("User not found in public.users table.");
        process.exit(1);
    }

    // 2. Update password in Supabase Auth
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
        password: password,
        email_confirm: true // Ensure email is confirmed too
    });

    if (error) {
        console.error("Error resetting password:", error.message);
        process.exit(1);
    }

    console.log(`✅ Successfully reset password for ${email}.`);
    process.exit(0);
}

main().catch(console.error);
