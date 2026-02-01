
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env. Ensure SUPABASE_SERVICE_ROLE_KEY is set.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const bucketName = 'safeguarding-evidence';
    console.log(`Checking for bucket: ${bucketName}...`);

    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error("Error listing buckets:", listError);
        return;
    }

    const bucket = buckets.find(b => b.name === bucketName);
    if (!bucket) {
        console.log(`Bucket '${bucketName}' NOT found. Creating...`);
        const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
            public: false, // Ensure it's private as per security standards
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/png',
                'image/jpeg',
                'image/webp'
            ]
        });

        if (createError) {
            console.error(`Failed to create bucket '${bucketName}':`, createError);
        } else {
            console.log(`Bucket '${bucketName}' created successfully.`);
        }
    } else {
        console.log(`Bucket '${bucketName}' already exists.`);
    }
}

main().catch(console.error);
