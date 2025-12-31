import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function check() {
    try {
        const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log("Tables:", tables.map(t => t.table_name).sort());

        // Also check columns of users table
        const columns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
        console.log("Users Columns:", columns.map(c => c.column_name).sort());

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
check();
