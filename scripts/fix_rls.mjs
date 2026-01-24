
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL must be set.");
    process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL);

async function main() {
    console.log("Connecting to database...");

    try {
        // Enable RLS on storage.objects content
        // Note: Supabase storage uses `storage` schema and `objects` table.
        // We need to make sure we are targeting the right table.
        // Often it is `storage.objects`.

        console.log("Enabling RLS on storage.objects...");
        await sql`ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`;

        console.log("Creating/Replacing policies...");

        // 1. Public Read Policy
        // Only for 'uploads' bucket
        await sql`
            DROP POLICY IF EXISTS "Public Access" ON storage.objects;
        `;
        await sql`
            CREATE POLICY "Public Access"
            ON storage.objects FOR SELECT
            USING ( bucket_id = 'uploads' );
        `;

        // 2. Authenticated Upload Policy
        await sql`
            DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
        `;
        // Supabase Auth uses auth.uid() function.
        // We need to be careful: if we are running this as a service role or postgres admin, we are creating the policy.
        // The policy will be evaluated when the User tries to upload via Supabase Client (which uses PostgREST/Supabase Auth).
        await sql`
            CREATE POLICY "Authenticated Upload"
            ON storage.objects FOR INSERT
            TO authenticated
            WITH CHECK ( bucket_id = 'uploads' );
        `;

        // 3. Authenticated Update Policy (Optional, for overwrite/delete my own files)
        // Usually checked against owner
        await sql`
            DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
        `;
        await sql`
            CREATE POLICY "Authenticated Update"
            ON storage.objects FOR UPDATE
            TO authenticated
            USING ( bucket_id = 'uploads' AND owner = auth.uid() )
            WITH CHECK ( bucket_id = 'uploads' AND owner = auth.uid() );
        `;

        await sql`
            DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
        `;
        await sql`
            CREATE POLICY "Authenticated Delete"
            ON storage.objects FOR DELETE
            TO authenticated
            USING ( bucket_id = 'uploads' AND owner = auth.uid() );
        `;

        console.log("Policies applied successfully.");

    } catch (err) {
        console.error("Error applying RLS:", err);
    } finally {
        await sql.end();
    }
}

main();
