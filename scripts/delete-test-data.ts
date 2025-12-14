import { db } from "../server/db";
import { users, musicianProfiles, bands, gigs } from "../shared/schema";
import { eq, like } from "drizzle-orm";

const TEST_EMAIL_SUFFIX = "@test.vic.band";

async function cleanup() {
    console.log("🧹 Starting cleanup...");

    const usersToDelete = await db.query.users.findMany({
        where: like(users.email, `%${TEST_EMAIL_SUFFIX}`),
    });

    if (usersToDelete.length > 0) {
        console.log(`Found ${usersToDelete.length} test users to delete.`);

        for (const u of usersToDelete) {
            console.log(`Deleting data for user: ${u.email}`);

            // Delete things linked to user
            await db.delete(musicianProfiles).where(eq(musicianProfiles.userId, u.id));
            await db.delete(gigs).where(eq(gigs.creatorId, u.id));

            // Delete bands and their gigs
            const userBands = await db.query.bands.findMany({ where: eq(bands.userId, u.id) });
            for (const b of userBands) {
                await db.delete(gigs).where(eq(gigs.bandId, b.id));
                await db.delete(bands).where(eq(bands.id, b.id));
            }

            await db.delete(users).where(eq(users.id, u.id));
        }
        console.log("✅ Cleanup complete. All test data removed.");
    } else {
        console.log("ℹ️ No test data found.");
    }
    process.exit(0);
}

cleanup().catch((err) => {
    console.error("❌ Cleanup failed:", err);
    process.exit(1);
});
