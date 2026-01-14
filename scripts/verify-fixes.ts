import "dotenv/config";
import pg from "pg";

async function main() {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is not set");
        process.exit(1);
    }
    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        await client.connect();

        // Check RLS status for sensitive tables
        const rls = await client.query(`
            SELECT tablename, rowsecurity 
            FROM pg_catalog.pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN ('site_settings', 'feature_flags', 'users', 'bands', 'gigs', 'musician_profiles', 'marketplace_listings');
        `);
        console.log("RLS Status (should be true for all):");
        rls.rows.forEach(row => console.log(`${row.tablename}: ${row.rowsecurity}`));

        // Check if a sample policy is using the optimized subquery
        const policies = await client.query(`
            SELECT polname, polqual 
            FROM pg_policy 
            JOIN pg_class ON pg_policy.polrelid = pg_class.oid 
            WHERE pg_class.relname = 'users' AND polname = 'users_self_read';
        `);
        console.log("\nSample Optimized Policy (users_self_read):");
        if (policies.rows[0]) {
            console.log(policies.rows[0].polqual);
        } else {
            console.log("Policy not found.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
main();
