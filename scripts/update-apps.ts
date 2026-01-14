import "dotenv/config";
import { db } from "../server/db";
import { apps } from "../shared/schema";
import { eq, ne, and, inArray } from "drizzle-orm";

/**
 * Updates the apps table to:
 * 1. Deactivate all placeholder apps (not Local Music Network or Volunteer Passport)
 * 2. Add/update Local Music Network and Volunteer Passport
 */
async function updateApps() {
    console.log("🔄 Updating Apps...");

    // Real apps to keep active
    const realApps = [
        {
            name: "Local Music Network",
            description: "Connect with musicians, find gigs, and join bands in your local area.",
            iconUrl: "https://api.iconify.design/lucide:music.svg",
            route: "/local-music-network",
            category: "Music",
            isBeta: false,
            isActive: true,
        },
        {
            name: "Volunteer Passport",
            description: "Track your volunteering hours, find opportunities, and manage your impact.",
            iconUrl: "https://api.iconify.design/lucide:heart-handshake.svg",
            route: "/volunteer-passport",
            category: "Community",
            isBeta: true,
            isActive: true,
        },
    ];

    // 1. Deactivate all apps except our real ones
    const realAppNames = realApps.map(a => a.name);
    console.log("📴 Deactivating placeholder apps...");

    const deactivated = await db
        .update(apps)
        .set({ isActive: false })
        .where(
            and(
                eq(apps.isActive, true),
                // Deactivate apps NOT in our real apps list
            )
        )
        .returning({ name: apps.name });

    // Actually, let's be more specific - deactivate ALL, then activate only real ones
    await db.update(apps).set({ isActive: false });
    console.log("📴 All apps deactivated.");

    // 2. Upsert each real app
    for (const app of realApps) {
        const existing = await db.select().from(apps).where(eq(apps.name, app.name));

        if (existing.length === 0) {
            // Insert new
            await db.insert(apps).values(app);
            console.log(`✅ Inserted: ${app.name}`);
        } else {
            // Update existing
            await db
                .update(apps)
                .set({
                    description: app.description,
                    iconUrl: app.iconUrl,
                    route: app.route,
                    category: app.category,
                    isBeta: app.isBeta,
                    isActive: true, // Activate it
                })
                .where(eq(apps.name, app.name));
            console.log(`🔄 Updated: ${app.name}`);
        }
    }

    // 3. Verify
    const activeApps = await db.select().from(apps).where(eq(apps.isActive, true));
    console.log(`\n✨ Done! Active apps: ${activeApps.length}`);
    activeApps.forEach((a: any) => console.log(`   - ${a.name} → ${a.route}`));

    process.exit(0);
}

updateApps().catch(e => {
    console.error("❌ Update failed:", e);
    process.exit(1);
});
