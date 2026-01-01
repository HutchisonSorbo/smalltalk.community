
import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function inspectConstraints() {
    console.log("🔍 Inspecting constraints on public.users...");

    try {
        const constraints = await sql`
            SELECT conname, pg_get_constraintdef(oid) as def
            FROM pg_constraint
            WHERE conrelid = 'public.users'::regclass
        `;

        console.log("Found constraints:");
        constraints.forEach(c => {
            console.log(`- ${c.conname}: ${c.def}`);
        });

    } catch (error) {
        console.error("❌ Error inspecting constraints:", error);
    } finally {
        await sql.end();
    }
}

inspectConstraints();
