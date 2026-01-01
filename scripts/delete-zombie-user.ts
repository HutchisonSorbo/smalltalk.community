
import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function deleteZombie() {
    console.log("🧹 Deleting zombie user...");
    const email = "smalltalkcommunity.backup@gmail.com";

    try {
        const result = await sql`
            DELETE FROM public.users WHERE email = ${email}
            RETURNING id, email;
        `;

        if (result.length > 0) {
            console.log("✅ Deleted:", result[0]);
        } else {
            console.log("No user found to delete.");
        }

    } catch (error) {
        console.error("❌ Error deleting user:", error);
    } finally {
        await sql.end();
    }
}

deleteZombie();
