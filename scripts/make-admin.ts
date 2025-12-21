
import { db } from "../server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

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

    await db.update(users).set({ isAdmin: true }).where(eq(users.id, user.id));
    console.log(`User ${email} is now an admin.`);
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
