
import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function verifyProfile() {
    console.log("🔍 Verifying User Profiles...");

    try {
        // Check for the known email
        const email = 'smalltalkcommunity.backup@gmail.com';

        console.log(`Checking for ${email}...`);

        const authUser = await sql`
            SELECT id, email FROM auth.users WHERE email = ${email};
        `;

        if (authUser.length === 0) {
            console.log("❌ Auth user not found!");
        } else {
            console.log(`✅ Auth user found: ${authUser[0].id}`);

            const publicUser = await sql`
                SELECT id, email, first_name FROM public.users WHERE id = ${authUser[0].id.toString()};
            `;

            if (publicUser.length === 0) {
                console.log("❌ Public profile NOT found!");

                // Check if there's ANY profile with that email?
                const anyProfile = await sql`SELECT * FROM public.users WHERE email = ${email}`;
                if (anyProfile.length > 0) {
                    console.log(`⚠️  Found a profile with email but DIFFERENT ID: ${anyProfile[0].id}`);
                }

            } else {
                console.log(`✅ Public profile found: ${publicUser[0].id}`);
                console.log(publicUser[0]);
            }
        }

    } catch (error) {
        console.error("❌ Verification failed:", error);
    } finally {
        await sql.end();
    }
}

verifyProfile();
