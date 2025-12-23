import "dotenv/config";
import { db } from "../server/db";
import { users, sysRoles, sysUserRoles } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const email = process.argv[2];

if (!email) {
    console.error("Please provide an email address.");
    process.exit(1);
}

async function main() {
    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!user) {
        console.error("User not found.");
        process.exit(1);
    }

    // Dual Write: Legacy
    await db.update(users).set({ isAdmin: true }).where(eq(users.id, user.id));

    // Dual Write: RBAC (New)
    // 1. Ensure 'super_admin' role exists
    const [existingRole] = await db.select().from(sysRoles).where(eq(sysRoles.name, "super_admin")).limit(1);
    let roleId = existingRole?.id;

    if (!roleId) {
        const [newRole] = await db.insert(sysRoles).values({ name: "super_admin", description: "God Mode" }).returning();
        roleId = newRole.id;
    }

    // 2. Assign role if not exists
    const [existingLink] = await db
        .select()
        .from(sysUserRoles)
        .where(and(eq(sysUserRoles.userId, user.id), eq(sysUserRoles.roleId, roleId)))
        .limit(1);

    if (!existingLink) {
        await db.insert(sysUserRoles).values({ userId: user.id, roleId });
    }

    console.log(`User ${email} is now an admin (Legacy + RBAC super_admin).`);
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
