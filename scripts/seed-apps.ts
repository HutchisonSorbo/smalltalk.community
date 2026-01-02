
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
            iconUrl: "/local-music-network/icon.svg",
            route: "/local-music-network",
            category: "Music",
            isBeta: false,
            isActive: true,
        },
        {
            name: "Volunteer Passport",
            description: "Track your volunteering hours, find opportunities, and manage your impact.",
            iconUrl: "/volunteer-passport/icon.svg",
            route: "/volunteer-passport",
            category: "Community",
            isBeta: true,
            isActive: true,
        },
        {
            name: "Youth Service Navigator",
            description: "Find mental health and wellbeing support services for young people aged 12-25.",
            iconUrl: "/youth-service-navigator/icon.svg",
            route: "/youth-service-navigator",
            category: "Health & Wellbeing",
            isBeta: true,
            isActive: true,
        },
        {
            name: "Local Apprenticeship & Traineeship Hub",
            description: "Discover apprenticeships, traineeships, and career pathways across Victoria.",
            iconUrl: "/apprenticeship-hub/icon.svg",
            route: "/apprenticeship-hub",
            category: "Education & Careers",
            isBeta: true,
            isActive: true,
        },
        {
            name: "Peer Support Group Finder",
            description: "Find peer-led mental health support groups in your area or online.",
            iconUrl: "/peer-support-finder/icon.svg",
            route: "/peer-support-finder",
            category: "Health & Wellbeing",
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
            // Update existing app to sync icon and other fields
            await db.update(apps).set({
                description: app.description,
                iconUrl: app.iconUrl,
                route: app.route,
                category: app.category,
                isBeta: app.isBeta,
                isActive: app.isActive,
            }).where(eq(apps.name, app.name));
            console.log(`🔄 Updated ${app.name}`);
        }
    }

    console.log("✨ App seeding complete.");
    process.exit(0);
}

seedApps().catch(e => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
});
