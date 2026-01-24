
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load usage of .env is tricky in ES modules without a library unless we use dotenv
// Assuming we can run this with access to env vars or we load them manually.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

// Use Service Role key if available for administrative tasks, otherwise anon key might fail to list buckets if RLS is strict.
console.log(`Connecting to ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error("Error listing buckets:", error);
        return;
    }

    console.log("Existing buckets:", data.map(b => b.name));

    const uploadsBucket = data.find(b => b.name === 'uploads');
    if (!uploadsBucket) {
        console.log("Bucket 'uploads' NOT found.");

        // Attempt to create it if we have service role key (usually we do in local dev)
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.log("Attempting to create 'uploads' bucket...");
            const { data: bucket, error: createError } = await supabase.storage.createBucket('uploads', {
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
            });
            if (createError) {
                console.error("Failed to create bucket:", createError);
            } else {
                console.log("Bucket 'uploads' created successfully.");
            }
        } else {
            console.log("Cannot create bucket: SUPABASE_SERVICE_ROLE_KEY not found in .env");
        }

    } else {
        console.log("Bucket 'uploads' exists.");
        console.log("Public:", uploadsBucket.public);
    }
}

main().catch(console.error);
