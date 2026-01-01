
import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import { createInterface } from 'readline';
import { queryClient } from "../server/db";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deleteZombie() {
    const email = process.argv[2];

    if (!email) {
        console.error("❌ Error: Please provide an email address.");
        console.log("Usage: tsx scripts/delete-zombie-user.ts user@example.com");
        process.exit(1);
    }

    console.log(`\n⚠️  WARNING: You are about to DELETE the user: ${email}`);
    console.log("This action cannot be undone and will cascade to all user data.\n");

    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const confirmed = await new Promise<boolean>((resolve) => {
        rl.question(`Are you sure you want to delete ${email}? (yes/no): `, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'yes');
        });
    });

    if (!confirmed) {
        console.log("Operation cancelled.");
        process.exit(0);
    }

    console.log("Processing delete in 3 seconds... (Ctrl+C to cancel)");
    await new Promise(r => setTimeout(r, 3000));

    console.log(`🧹 Deleting user: ${email}...`);

    try {
        // Direct SQL lookup to avoid listing all users
        const users = await queryClient`
            SELECT id FROM auth.users WHERE email = ${email}
        `;

        if (!users || users.length === 0) {
            console.log("⚠️  No user found with that email.");
            process.exit(0);
        }

        const userId = users[0].id;

        // Delete using Admin API - handles all cleanup automatically
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

        if (deleteError) {
            console.error("❌ Error deleting user:", deleteError);
            process.exit(1);
        } else {
            console.log(`✅ Successfully deleted user: ${email} (ID: ${userId})`);
        }

    } catch (error) {
        console.error("❌ Unexpected error:", error);
        process.exit(1);
    }
}

deleteZombie();
