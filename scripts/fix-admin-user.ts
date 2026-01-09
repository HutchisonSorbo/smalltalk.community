import 'dotenv/config';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL not set');
}

const sql = postgres(databaseUrl, { prepare: false });

const email = process.argv[2] || 'smalltalkcommunity.backup@gmail.com';

async function run() {
    try {
        console.log('=== Step 1: Check and fix users table schema ===\n');

        // Check existing columns
        const cols = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
        console.log('Existing columns:', cols.map(c => c.column_name).join(', '));

        // Add missing columns
        const hasSuspended = cols.some(c => c.column_name === 'is_suspended');
        if (!hasSuspended) {
            console.log('\n⚠️ Adding missing is_suspended column...');
            await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE`;
            console.log('✓ Added is_suspended column');
        } else {
            console.log('✓ is_suspended column exists');
        }

        console.log('\n=== Step 2: Check admin user ===\n');
        console.log(`Looking for: ${email}\n`);

        // Check user in users table
        const userResult = await sql`
      SELECT id, email, first_name, last_name, is_admin
      FROM users
      WHERE email = ${email}
    `;

        if (userResult.length === 0) {
            console.log('❌ User NOT found in users table');

            // Check auth.users
            const authResult = await sql`
        SELECT id, email, created_at
        FROM auth.users
        WHERE email = ${email}
      `;

            if (authResult.length > 0) {
                const authUser = authResult[0];
                console.log('✓ Found in auth.users:', authUser.id);
                console.log('\nCreating profile in users table...');

                await sql`
          INSERT INTO users (id, email, is_admin, onboarding_completed, created_at)
          VALUES (${authUser.id}, ${authUser.email}, true, false, NOW())
          ON CONFLICT (id) DO UPDATE SET is_admin = true
        `;
                console.log('✓ Created user profile with is_admin = true');
            } else {
                console.log('❌ User not found in auth.users either');
                console.log('   They may need to sign up first');
            }
        } else {
            const user = userResult[0];
            console.log('✓ User found in users table:');
            console.log('  ID:', user.id);
            console.log('  Email:', user.email);
            console.log('  Name:', user.first_name || '(not set)', user.last_name || '');
            console.log('  is_admin:', user.is_admin);

            if (!user.is_admin) {
                console.log('\n⚠️ User is NOT an admin. Setting is_admin = true...');
                await sql`UPDATE users SET is_admin = true WHERE id = ${user.id}`;
                console.log('✓ Updated user to admin');
            } else {
                console.log('\n✓ User is already an admin');
            }
        }

        console.log('\n=== Done! ===\n');

    } finally {
        await sql.end();
    }
}

run().catch((e) => {
    console.error('Error:', e);
    process.exit(1);
});
