
import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

// We need a way to prompt. We can uses 'readline' for node.
import { createInterface } from 'readline';

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function deleteZombie() {
    const email = process.argv[2];

    if (!email) {
        console.error("❌ Error: Please provide an email address.");
        console.log("Usage: tsx scripts/delete-zombie-user.ts user@example.com");
        process.exit(1);
    }

    console.log(`\n⚠️  WARNING: You are about to DELETE the user: ${email}`);
    console.log("This action cannot be undone.\n");

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
        await sql.end();
        process.exit(0);
    }

    console.log("Processing delete in 3 seconds... (Ctrl+C to cancel)");
    await new Promise(r => setTimeout(r, 3000));

    console.log(`🧹 Deleting zombie user: ${email}...`);

    try {
        const result = await sql`
            DELETE FROM public.users WHERE email = ${email}
            RETURNING id, email;
        `;

        // Also check/delete from auth.users? Usually cascade handles it, 
        // but often we need to delete from Auth first to trigger cascade?
        // Actually, deleting from public.users might just be local.
        // For Supabase, we usually delete from auth.users via Admin API.
        // Direct SQL delete on auth.users is possible if using postgres connection.

        // Let's check if we deleted from public.
        if (result.length > 0) {
            console.log("✅ Deleted from public.users:", result[0]);
        } else {
            console.log("⚠️  No record found in public.users to delete.");
        }

        // Try deleting from auth.users
        const authResult = await sql`
            DELETE FROM auth.users WHERE email = ${email}
            RETURNING id, email;
        `;

        if (authResult.length > 0) {
            console.log("✅ Deleted from auth.users:", authResult[0]);
        } else {
            console.log("⚠️  No record found in auth.users to delete (or already gone).");
        }


    } catch (error) {
        console.error("❌ Error deleting user:", error);
    } finally {
        await sql.end();
    }
}

deleteZombie();
