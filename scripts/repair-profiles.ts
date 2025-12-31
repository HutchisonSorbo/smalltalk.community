
import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function repairProfiles() {
    console.log("🔧 Repairing User Profiles...");

    try {
        // 1. Find users in auth.users who are NOT in public.users
        const missingProfiles = await sql`
            SELECT au.id, au.email, au.raw_user_meta_data, au.created_at, au.updated_at
            FROM auth.users au
            LEFT JOIN public.users pu ON au.id::text = pu.id
            WHERE pu.id IS NULL;
        `;

        if (missingProfiles.length === 0) {
            console.log("✅ No missing profiles found.");
            return;
        }

        console.log(`Found ${missingProfiles.length} users with missing profiles. Fixing...`);

        await sql.begin(async sql => {
            for (const user of missingProfiles) {
                const meta = user.raw_user_meta_data || {};

                await sql`
                    INSERT INTO public.users (
                        id,
                        email,
                        first_name,
                        last_name,
                        user_type,
                        account_type,
                        organisation_name,
                        date_of_birth,
                        created_at,
                        updated_at
                    ) VALUES (
                        ${user.id},
                        ${user.email},
                        ${meta.first_name || 'Unknown'},
                        ${meta.last_name || 'User'},
                        ${meta.user_type || 'musician'},
                        ${meta.account_type || 'Individual'},
                        ${meta.organisation_name || null},
                        ${meta.date_of_birth ? new Date(meta.date_of_birth) : null},
                        ${user.created_at},
                        ${user.updated_at}
                    )
                `;
                console.log(`✅ Created profile for ${user.email} (${user.id})`);
            }
        });

        console.log("✨ Repair complete.");

    } catch (error) {
        console.error("❌ Repair failed:", error);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

repairProfiles();
