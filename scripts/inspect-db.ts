import "dotenv/config";
import pg from "pg";

async function main() {
    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT tablename 
            FROM pg_catalog.pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename;
        `);
        console.log("Tables in public schema:");
        res.rows.forEach(row => console.log(`- ${row.tablename}`));

        const rls = await client.query(`
            SELECT tablename, rowsecurity 
            FROM pg_catalog.pg_tables 
            WHERE schemaname = 'public' 
            AND rowsecurity = false;
        `);
        console.log("\nTables WITHOUT RLS enabled:");
        rls.rows.forEach(row => console.log(`- ${row.tablename}`));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
main();
