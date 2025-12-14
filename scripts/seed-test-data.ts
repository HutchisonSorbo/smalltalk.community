import { db } from "../server/db";
import { users, musicianProfiles, bands, gigs, type UpsertUser, type InsertMusicianProfile, type InsertBand, type InsertGig } from "../shared/schema";
import { eq, like } from "drizzle-orm";
import { victoriaLocations } from "../lib/victoriaLocations";

const TEST_EMAIL_SUFFIX = "@test.vic.band";

// Helper to get random item
function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Random coordinate generator within Victoria, Australia roughly
// Lat: -34 to -39, Long: 141 to 150
// Centered more around Melbourne: Lat -37.5 to -38.2, Long 144.5 to 145.5 for visibility
function getRandomLocation() {
    const latMin = -38.2;
    const latMax = -37.5;
    const longMin = 144.5;
    const longMax = 145.5;

    const lat = latMin + Math.random() * (latMax - latMin);
    const long = longMin + Math.random() * (longMax - longMin);

    return {
        latitude: lat.toFixed(6),
        longitude: long.toFixed(6)
    };
}

const INSTRUMENTS = ["Guitar", "Bass", "Drums", "Vocals", "Piano", "Saxophone"];
const GENRES = ["Rock", "Jazz", "Blues", "Metal", "Indie", "Pop"];

const PROFILE_IMAGES = [
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200&h=200",
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&q=80&w=200&h=200",
    "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=200&h=200",
    "https://images.unsplash.com/photo-1507838153414-b4b713384ebd?auto=format&fit=crop&q=80&w=200&h=200",
    "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=200&h=200",
];

const BAND_IMAGES = [
    "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&q=80&w=400&h=200",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=400&h=200",
    "https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&q=80&w=400&h=200",
];

async function seed() {
    console.log("🌱 Starting seed...");

    // 1. Cleanup
    console.log("🧹 Cleaning up old test data...");
    const usersToDelete = await db.query.users.findMany({
        where: like(users.email, `%${TEST_EMAIL_SUFFIX}`),
    });

    if (usersToDelete.length > 0) {
        console.log(`Found ${usersToDelete.length} test users to delete.`);
        // We rely on cascade delete if configured, but to be safe and explicit:
        // Note: Drizzle schema definition defines foreign keys but we need to check DB level constraints or delete manually.
        // Given the schema file doesn't explicitly show `onDelete: 'cascade'`, we should delete children first or rely on DB.
        // Let's assume manual deletion is safer for this script to avoid FK errors if cascades aren't there.

        for (const u of usersToDelete) {
            // Delete things linked to user
            await db.delete(musicianProfiles).where(eq(musicianProfiles.userId, u.id));
            await db.delete(gigs).where(eq(gigs.creatorId, u.id)); // And other FKs... 
            // Bands is tricky because of band members etc, but let's try simplified approach first.
            const userBands = await db.query.bands.findMany({ where: eq(bands.userId, u.id) });
            for (const b of userBands) {
                await db.delete(gigs).where(eq(gigs.bandId, b.id)); // Delete band gigs
                await db.delete(bands).where(eq(bands.id, b.id));
            }

            await db.delete(users).where(eq(users.id, u.id));
        }
        console.log("✅ Cleanup complete.");
    }


    // 2. Seed Musicians
    console.log("🎸 Seeding 20 musicians...");
    const musicianUsers: string[] = [];

    for (let i = 0; i < 20; i++) {
        // Create User
        const [user] = await db.insert(users).values({
            email: `musician_${i}${TEST_EMAIL_SUFFIX}`,
            firstName: `TestMusician`,
            lastName: `${i}`,
            profileImageUrl: PROFILE_IMAGES[i % PROFILE_IMAGES.length],
        }).returning();

        musicianUsers.push(user.id);

        // Get a random location that has coordinates
        let randomLoc = getRandomItem(victoriaLocations);
        // Ensure lat/long exist (interface says optional but data usually has it)
        while (!randomLoc.latitude || !randomLoc.longitude) {
            randomLoc = getRandomItem(victoriaLocations);
        }

        const instrument = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];
        const genre = GENRES[Math.floor(Math.random() * GENRES.length)];

        // Create Profile
        await db.insert(musicianProfiles).values({
            userId: user.id,
            name: `Test Musician ${i}`,
            bio: `I am a musician based in ${randomLoc.suburb}. This is a test profile.`,
            instruments: [instrument],
            genres: [genre],
            location: randomLoc.suburb, // Use real suburb name
            // Drizzle/Postgres might handle string->decimal, but schema defines them as text or decimal?
            // Schema view says latitude: text.
            latitude: randomLoc.latitude,
            longitude: randomLoc.longitude,
            profileImageUrl: PROFILE_IMAGES[i % PROFILE_IMAGES.length],
            isLookingForGroup: Math.random() > 0.5,
            isLocationShared: true,
            socialLinks: {
                soundcloud: "https://soundcloud.com/discovery", // Generic link
            },
        });
    }


    // 3. Seed Bands
    console.log("🥁 Seeding 10 bands...");
    const bandIds: string[] = [];

    for (let i = 0; i < 10; i++) {
        // Create User for Band Owner
        const [user] = await db.insert(users).values({
            email: `band_owner_${i}${TEST_EMAIL_SUFFIX}`,
            firstName: `BandOwner`,
            lastName: `${i}`,
        }).returning();

        const genre = GENRES[Math.floor(Math.random() * GENRES.length)];

        const [band] = await db.insert(bands).values({
            userId: user.id,
            name: `Test Band ${i}`,
            bio: "We are a test band rocking the database.",
            genres: [genre],
            location: "Melbourne, VIC",
            profileImageUrl: BAND_IMAGES[i % BAND_IMAGES.length],
        }).returning();

        bandIds.push(band.id);
    }

    // 4. Seed Gigs
    console.log("🎫 Seeding 5 gigs...");
    // Use first 5 musicians as creators
    for (let i = 0; i < 5; i++) {
        const creatorId = musicianUsers[i]; // They have profiles
        const isBandGig = Math.random() > 0.5;

        const date = new Date();
        date.setDate(date.getDate() + 7 + i); // 1 week + i days from now

        await db.insert(gigs).values({
            creatorId: creatorId,
            title: `Test Gig ${i}`,
            description: "A seeded test gig event.",
            location: "The Test Venue, Melbourne",
            date: date,
            genre: "Rock",
            bandId: isBandGig ? bandIds[i % bandIds.length] : undefined,
            // musicianId could be set if solo, but let's stick to simple
        });
    }

    console.log("✨ Seeding complete!");
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
