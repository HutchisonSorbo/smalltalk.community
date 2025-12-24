
import 'dotenv/config';
import { db } from "../server/db";
import { sql } from "drizzle-orm";

const tables = [
    "payload_kv",
    "payload_migrations",
    "cms_users",
    "cms_users_sessions",
    "payload_locked_documents",
    "payload_locked_documents_rels",
    "pages",
    "media",
    "payload_preferences",
    "payload_preferences_rels"
];

async function main() {
    console.log("Enabling RLS on Payload CMS tables...");

    for (const table of tables) {
        try {
            console.log(`Enabling RLS for ${table}...`);
            // Use raw SQL to enable RLS
            // We need to wrap table name in quotes to handle case sensitivity if needed, 
            // though typically public tables are lowercase in postgres. 
            // Payload usually creates lowercase tables.
            await db.execute(sql.raw(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`));

            // Optionally create a policy that allows everything for service role 
            // or specific access. For now, just enabling RLS satisfies the linter.
            // However, enabling RLS without policies denies all access by default 
            // to public/authenticated roles (except superuser/owner).
            // Payload generally uses its own adapter and might connect as a user that owns the tables 
            // or has sufficient privileges. If it connects as 'postgres' or similar, it bypasses RLS.
            // If it connects as a service_role equivalent, it bypasses RLS.

            console.log(`RLS enabled for ${table}`);
        } catch (error) {
            console.error(`Error enabling RLS for ${table}:`, error);
        }
    }

    console.log("Migration complete.");
    process.exit(0);
}

main();
