import 'dotenv/config';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL not set');
}

const sql = postgres(databaseUrl, { prepare: false });

async function run() {
    try {
        console.log('Checking if users_service_read policy exists...');

        // Check if policy exists
        const exists = await sql`
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'users' AND policyname = 'users_service_read'
    `;

        if (exists.length === 0) {
            console.log('Creating users_service_read policy...');
            await sql`
        CREATE POLICY "users_service_read" ON "users"
        FOR SELECT
        TO service_role
        USING (true)
      `;
            console.log('✓ Created users_service_read policy');
        } else {
            console.log('✓ Policy already exists');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    } finally {
        await sql.end();
    }
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
