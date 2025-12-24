
import 'dotenv/config';
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Adding organisation_name column to users table...");
    try {
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS organisation_name varchar(255)`);
        console.log("Column added successfully.");
    } catch (error) {
        console.error("Error adding column:", error);
    }
    process.exit(0);
}

main();
