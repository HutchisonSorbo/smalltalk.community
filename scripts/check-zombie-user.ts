
import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function checkZombie() {
    console.log("🔍 Checking for existing user...");
    const email = "smalltalkcommunity.backup@gmail.com";

    try {
        const users = await sql`
            SELECT id, email, created_at FROM public.users WHERE email = ${email}
        `;

        if (users.length > 0) {
            console.log("found existing public.users record:", users[0]);
        } else {
            console.log("No record found in public.users for", email);
        }

        const authUsers = await sql`
            SELECT id, email FROM auth.users WHERE email = ${email}
        `;
        if (authUsers.length > 0) {
            console.log("found existing auth.users record:", authUsers[0]);
        } else {
            console.log("No record found in auth.users for", email);
        }


    } catch (error) {
        console.error("❌ Error querying DB:", error);
    } finally {
        await sql.end();
    }
}

checkZombie();
