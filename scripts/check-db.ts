
import "dotenv/config";
import { db } from "../lib/db";
import { apps } from "@shared/schema";
import { sql } from "drizzle-orm";

async function main() {
    try {
        console.log("Checking DB connection via Drizzle...");

        console.log("Checking 'apps' table...");
        try {
            const appsResult = await db.select().from(apps).limit(1);
            console.log("'apps' table accessible. Rows:", appsResult.length);
        } catch (e) {
            console.error("'apps' table access failed:", e);
        }

        process.exit(0);
    } catch (e) {
        console.error("DB Connection failed:", e);
        process.exit(1);
    }
}

main();
