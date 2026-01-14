import "dotenv/config";
import pg from "pg";
import fs from "fs";
import path from "path";

async function main() {
    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        await client.connect();
        const sqlPath = path.join(process.cwd(), "scripts/apply-security-fixes.sql");
        const sql = fs.readFileSync(sqlPath, "utf8");

        console.log("Applying security and performance fixes...");
        await client.query(sql);
        console.log("Successfully applied all fixes!");

    } catch (err) {
        console.error("Failed to apply fixes:", err);
    } finally {
        await client.end();
    }
}
main();
