
import dotenv from "dotenv";
dotenv.config();

import { db } from "../server/db";
import { apps } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedApps() {
    console.log("🌱 Seeding Apps...");

    const appsToSeed = [
        {
            name: "Local Music Network",
            description: "Connect with musicians, find gigs, and join bands in your local area.",
            iconUrl: "/icons/music-note.svg", // Assuming these exist or using placeholders
            route: "/local-music-network",
            category: "Music",
            isBeta: false,
            isActive: true,
        },
        {
            name: "Volunteer Passport",
            description: "Track your volunteering hours, find opportunities, and manage your impact.",
            iconUrl: "/icons/hand-heart.svg",
            route: "/volunteer-passport",
            category: "Community",
            isBeta: true,
            isActive: true,
        },
    ];

    for (const app of appsToSeed) {
        // Check if exists
        const existing = await db.select().from(apps).where(eq(apps.name, app.name));

        if (existing.length === 0) {
            await db.insert(apps).values(app);
            console.log(`✅ Inserted ${app.name}`);
        } else {
            console.log(`ℹ️  ${app.name} already exists, skipping.`);
        }
    }

    console.log("✨ App seeding complete.");
    process.exit(0);
}

seedApps().catch(e => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
});
