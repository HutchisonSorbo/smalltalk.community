import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function cleanup() {
    try {
        console.log("Dropping user_apps...");
        await db.execute(sql`DROP TABLE IF EXISTS user_apps CASCADE`);
        console.log("Dropping apps...");
        await db.execute(sql`DROP TABLE IF EXISTS apps CASCADE`);
        console.log("Cleanup complete.");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
cleanup();
