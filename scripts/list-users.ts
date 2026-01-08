import "dotenv/config";
import { db } from "../server/db";
import { users, sysUserRoles, sysRoles } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    // Get email from command line argument
    const email = process.argv[2];

    if (!email) {
        console.error("Usage: npx tsx scripts/list-users.ts <email>");
        console.error("Example: npx tsx scripts/list-users.ts user@example.com");
        process.exit(1);
    }

    console.log(`Checking status for ${email}...`);

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
        console.error("User not found!");
        process.exit(1);
    }

    console.log(`Legacy isAdmin: ${user.isAdmin}`);

    const roles = await db
        .select({
            roleName: sysRoles.name
        })
        .from(sysUserRoles)
        .innerJoin(sysRoles, eq(sysUserRoles.roleId, sysRoles.id))
        .where(eq(sysUserRoles.userId, user.id));

    console.log("Assigned RBAC Roles:", roles.map(r => r.roleName).join(", ") || "None");

    if (user.isAdmin && roles.some(r => r.roleName === 'super_admin')) {
        console.log("✅ Promotion verified successfully.");
    } else {
        console.log("❌ Promotion verification failed.");
    }

    process.exit(0);
}

main().catch(console.error);
