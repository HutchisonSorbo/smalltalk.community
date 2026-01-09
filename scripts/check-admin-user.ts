import 'dotenv/config';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL not set');
}

const email = process.argv[2] || 'smalltalkcommunity.backup@gmail.com';

const sql = postgres(databaseUrl, { prepare: false });

async function run() {
    try {
        console.log(`\n=== Checking user: ${email} ===\n`);

        // 1. Check if user exists in users table
        const userResult = await sql`
      SELECT id, email, first_name, last_name, is_admin, is_suspended, onboarding_completed
      FROM users
      WHERE email = ${email}
    `;

        if (userResult.length === 0) {
            console.log('❌ User NOT found in users table');

            // Check if they exist in Supabase auth
            const authResult = await sql`
        SELECT id, email, created_at
        FROM auth.users
        WHERE email = ${email}
      `;

            if (authResult.length > 0) {
                console.log('✓ User exists in auth.users:', authResult[0]);
                console.log('\n👉 User needs to complete onboarding to create profile in users table');
                console.log('   Or we can create the profile manually...\n');

                // Create user profile
                const authUser = authResult[0];
                console.log('Creating user profile...');

                await sql`
          INSERT INTO users (id, email, is_admin, onboarding_completed, created_at)
          VALUES (${authUser.id}, ${authUser.email}, true, false, NOW())
          ON CONFLICT (id) DO UPDATE SET is_admin = true
        `;

                console.log('✓ Created/updated user profile with is_admin = true');
            } else {
                console.log('❌ User not found in auth.users either');
            }
        } else {
            const user = userResult[0];
            console.log('✓ User found in users table:');
            console.log('  ID:', user.id);
            console.log('  Email:', user.email);
            console.log('  Name:', user.first_name, user.last_name);
            console.log('  is_admin:', user.is_admin);
            console.log('  is_suspended:', user.is_suspended);
            console.log('  onboarding_completed:', user.onboarding_completed);

            if (!user.is_admin) {
                console.log('\n👉 User is NOT an admin. Setting is_admin = true...');
                await sql`UPDATE users SET is_admin = true WHERE id = ${user.id}`;
                console.log('✓ Updated user to admin');
            }

            if (user.is_suspended) {
                console.log('\n⚠️  User is SUSPENDED! Unsuspending...');
                await sql`UPDATE users SET is_suspended = false WHERE id = ${user.id}`;
                console.log('✓ Unsuspended user');
            }
        }

        console.log('\n✓ Done!\n');

    } finally {
        await sql.end();
    }
}

run().catch((e) => {
    console.error('Error:', e);
    process.exit(1);
});
