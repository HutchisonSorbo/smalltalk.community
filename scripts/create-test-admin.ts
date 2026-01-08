import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import { db } from "../server/db";
import { users, sysRoles, sysUserRoles } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
        console.error("Usage: npx tsx scripts/create-test-admin.ts <email> <password>");
        process.exit(1);
    }

    console.log(`Creating test admin: ${email}...`);

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { firstName: "Test", lastName: "Admin" }
    });

    if (authError) {
        if (authError.message.includes("already registered")) {
            console.log("User already exists in Supabase Auth. Proceeding to sync/promote.");
            // We need to fetch the existing user to get the ID
            const { data: { users: existingUsers }, error: fetchError } = await supabase.auth.admin.listUsers();
            const existingUser = existingUsers.find(u => u.email === email);
            if (!existingUser) throw new Error("Could not find existing user after 'already registered' error.");

            // Sync with public.users
            await syncAndPromote(existingUser.id, email);
        } else {
            console.error("Error creating auth user:", authError.message);
            process.exit(1);
        }
    } else if (authData.user) {
        console.log("✓ Auth user created:", authData.user.id);
        await syncAndPromote(authData.user.id, email);
    }

    console.log(`\n✅ Successfully setup test admin account: ${email}`);
    process.exit(0);
}

async function syncAndPromote(userId: string, email: string) {
    // 2. Ensure record exists in public.users
    const existingDbUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!existingDbUser) {
        console.log("Creating public.users record...");
        await db.insert(users).values({
            id: userId,
            email: email,
            firstName: "Test",
            lastName: "Admin",
            isAdmin: true,
            onboardingCompleted: true
        });
    } else {
        console.log("Updating existing public.users record...");
        await db.update(users).set({ isAdmin: true, onboardingCompleted: true }).where(eq(users.id, userId));
    }

    // 3. Promote via RBAC
    console.log("Promoting to super_admin role...");
    const [existingRole] = await db.select().from(sysRoles).where(eq(sysRoles.name, "super_admin")).limit(1);
    let roleId = existingRole?.id;

    if (!roleId) {
        const [newRole] = await db.insert(sysRoles).values({ name: "super_admin", description: "God Mode" }).returning();
        roleId = newRole.id;
    }

    const [existingLink] = await db
        .select()
        .from(sysUserRoles)
        .where(and(eq(sysUserRoles.userId, userId), eq(sysUserRoles.roleId, roleId)))
        .limit(1);

    if (!existingLink) {
        await db.insert(sysUserRoles).values({ userId: userId, roleId });
    }
}

main().catch(console.error);
