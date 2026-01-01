import "dotenv/config";
import { db } from "../lib/db";
import { apps } from "@shared/schema";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Starting DB Connectivity Check...");

    // 1. Log Sanitized URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("❌ Error: DATABASE_URL is not set.");
        process.exit(1);
    }

    try {
        const url = new URL(dbUrl);
        console.log(`Target Host: ${url.hostname} (Port: ${url.port || '5432'})`);
    } catch (e) {
        console.warn("⚠️ Warning: Could not parse DATABASE_URL for logging (credentials hidden).");
    }

    try {
        // 2. Explicit Connection Check (Ping)
        console.log("Testing connection...");
        try {
            await db.execute(sql`SELECT 1`);
            console.log("✅ Connection: Success");
        } catch (connError) {
            console.error("❌ Link connection failed. Unable to reach or authenticate with database.");
            console.error("Details:", connError);
            process.exit(1);
        }

        // 3. Table Access Check
        console.log("Testing table access ('apps')...");
        try {
            const result = await db.select().from(apps).limit(1);
            console.log(`✅ Table Access: Success. Found ${result.length} rows in 'apps'.`);
        } catch (tableError) {
            console.error("❌ Table access failed. Connection is good, but cannot query 'apps' table.");
            console.error("Details:", tableError);
            process.exit(1);
        }

        // 4. Success Summary
        console.log("\n--- check-db Success ---");
        console.log("All checks passed.");
        process.exit(0);

    } catch (unexpectedError) {
        console.error("❌ Unexpected script error:", unexpectedError);
        process.exit(1);
    }
}

main();
