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
                console.log('✓ User exists in auth.users:', authResult[0].id);
                console.log('\n👉 User needs to complete onboarding to create profile in users table');
                // Intentionally not creating users in this check-only script
            } else {
                console.log('❌ User not found in auth.users either');
            }
        } else {
            const user = userResult[0];
            console.log('✓ User found in users table:');
            console.log('  ID:', user.id);
            console.log('  Email:', user.email);

            // Check if ID matches auth.users
            const authResult = await sql`SELECT id FROM auth.users WHERE email = ${email}`;
            if (authResult.length > 0) {
                if (authResult[0].id === user.id) {
                    console.log('  ✓ ID matches auth.users.id');
                } else {
                    console.log(`  ❌ ID MISMATCH! auth.users.id = ${authResult[0].id}, users.id = ${user.id}`);
                }
            } else {
                console.log('  ❌ User NOT found in auth.users table!');
            }

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

        console.log('\n=== Step 2: Checking Tenant Memberships ===\n');

        // 2. Check if 'stc' tenant exists
        const tenantResult = await sql`
      SELECT id, code, name
      FROM tenants
      WHERE code = 'stc'
    `;

        if (tenantResult.length === 0) {
            console.log('❌ Tenant "stc" NOT found in tenants table');
        } else {
            const tenant = tenantResult[0];
            console.log(`✓ Tenant found: ${tenant.name} (${tenant.code})`);
            console.log('  ID:', tenant.id);

            // 3. Check membership for this user in this tenant
            const membershipResult = await sql`
        SELECT tm.id, tm.role, tm.joined_at, u.email
        FROM tenant_members tm
        JOIN users u ON tm.user_id = u.id
        WHERE u.email = ${email} AND tm.tenant_id = ${tenant.id}
      `;

            if (membershipResult.length === 0) {
                console.log(`❌ User ${email} is NOT a member of tenant "stc"`);
            } else {
                const membership = membershipResult[0];
                console.log(`✓ Membership found:`);
                console.log('  Role:', membership.role);
                console.log('  Joined:', membership.joined_at);
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
