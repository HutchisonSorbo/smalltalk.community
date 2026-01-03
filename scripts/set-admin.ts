/**
 * Script to set admin status for a user
 * Usage: npx tsx scripts/set-admin.ts <email>
 */

import "dotenv/config";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function setAdmin() {
    const email = process.argv[2];

    if (!email) {
        console.log("Usage: npx tsx scripts/set-admin.ts <email>");
        console.log("\nListing all users...\n");

        const allUsers = await db.query.users.findMany({
            columns: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isAdmin: true,
            },
            limit: 20,
        });

        if (allUsers.length === 0) {
            console.log("No users found in database.");
        } else {
            console.log("ID | Email | Name | isAdmin");
            console.log("-".repeat(80));
            allUsers.forEach(u => {
                console.log(`${u.id.slice(0, 8)}... | ${u.email} | ${u.firstName} ${u.lastName} | ${u.isAdmin ? '✅' : '❌'}`);
            });
        }
        process.exit(0);
    }

    console.log(`🔍 Looking for user with email: ${email}`);

    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!user) {
        console.error(`❌ User not found: ${email}`);
        process.exit(1);
    }

    console.log(`👤 Found user: ${user.firstName} ${user.lastName} (${user.id})`);
    console.log(`📊 Current admin status: ${user.isAdmin ? 'Yes' : 'No'}`);

    if (user.isAdmin) {
        console.log("✅ User is already an admin.");
    } else {
        console.log("🔧 Setting admin status...");

        await db.update(users)
            .set({ isAdmin: true })
            .where(eq(users.id, user.id));

        console.log("✅ User is now an admin!");
    }

    process.exit(0);
}

setAdmin().catch(console.error);
