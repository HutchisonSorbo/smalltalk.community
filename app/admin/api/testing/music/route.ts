import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/server/db";
import { users, musicianProfiles, bands } from "@shared/schema";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { sql, eq, notInArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Input validation schema
const createMusicEntitiesSchema = z.object({
    count: z.number().min(1).max(10),
    type: z.enum(["musician", "band"])
});

// Instruments and Genres (subset for testing)
const INSTRUMENTS = ["Guitar", "Bass", "Drums", "Vocals", "Keyboard/Piano", "Violin", "Saxophone"];
const GENRES = ["Rock", "Pop", "Jazz", "Blues", "Folk", "Country", "Indie"];
const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Professional"];

const BAND_NAMES_1 = ["The", "Electric", "Midnight", "Broken", "Cosmic", "Neon", "Urban", "Rustic"];
const BAND_NAMES_2 = ["Spiders", "Dreams", "Riders", "Echoes", "Hearts", "Vibes", "Wolves", "Orchestra"];

function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomSubset<T>(arr: T[], max: number): T[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * max) + 1);
}

/**
 * POST /admin/api/testing/music - Create test musician profiles and bands
 */
export async function POST(request: Request) {
    try {
        const admin = await requireAdmin();

        const json = await request.json();
        const parsed = createMusicEntitiesSchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid input", errors: parsed.error.errors },
                { status: 400 }
            );
        }

        const { count, type } = parsed.data;
        const createdNames: string[] = [];
        const testEmailPattern = '%@smalltalk.test';

        // Get test users
        const testUsers = await db.select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName
        })
            .from(users)
            .where(sql`email LIKE ${testEmailPattern}`)
            .limit(100);

        if (testUsers.length === 0) {
            return NextResponse.json(
                { message: "No test users found. Please create test individuals first." },
                { status: 400 }
            );
        }

        if (type === "musician") {
            // Find users who DON'T have a profile yet (checking simplistically by random attempt or better query)
            // A better way is to do a left join or NOT IN subquery, but with Drizzle/SQL simple approach:

            // Get existing musician user Ids
            const existingProfiles = await db.select({ userId: musicianProfiles.userId }).from(musicianProfiles);
            const existingUserIds = new Set(existingProfiles.map(p => p.userId));

            const candidates = testUsers.filter(u => !existingUserIds.has(u.id));

            if (candidates.length === 0) {
                return NextResponse.json(
                    { message: "All test users already have musician profiles. Create more individuals first." },
                    { status: 400 }
                );
            }

            for (let i = 0; i < count; i++) {
                if (candidates.length === 0) break;
                // Pick random candidate and remove from list
                const idx = Math.floor(Math.random() * candidates.length);
                const user = candidates[idx];
                candidates.splice(idx, 1);

                try {
                    await db.insert(musicianProfiles).values({
                        id: uuidv4(),
                        userId: user.id,
                        name: (user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : "Test Musician",
                        bio: "This is a test musician profile generated for end-to-end testing.",
                        instruments: randomSubset(INSTRUMENTS, 3),
                        genres: randomSubset(GENRES, 3),
                        experienceLevel: randomChoice(EXPERIENCE_LEVELS),
                        availability: "Flexible Schedule",
                        location: "Mitchell Shire", // Simplified
                        isActive: true,
                        isLookingForGroup: true,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    createdNames.push((user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : "Unknown");
                } catch (e) {
                    console.error(`Failed to create musician profile for ${user.id}`, e);
                }
            }

        } else if (type === "band") {
            for (let i = 0; i < count; i++) {
                const user = randomChoice(testUsers);
                const name = `${randomChoice(BAND_NAMES_1)} ${randomChoice(BAND_NAMES_2)} ${Math.floor(Math.random() * 1000)}`;

                try {
                    await db.insert(bands).values({
                        id: uuidv4(),
                        userId: user.id,
                        name: name,
                        bio: "This is a test band generated for end-to-end testing.",
                        genres: randomSubset(GENRES, 2),
                        influences: ["The Beatles", "Led Zeppelin", "Tame Impala"],
                        location: "Mitchell Shire",
                        isActive: true,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    createdNames.push(name);
                } catch (e) {
                    console.error(`Failed to create band for ${user.id}`, e);
                }
            }
        }

        console.log(`[Admin Test Create] Admin ${admin.email} created ${createdNames.length} ${type} entities`);

        return NextResponse.json({
            success: true,
            created: createdNames,
            count: createdNames.length
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating music entities:", error);

        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }

        return NextResponse.json(
            { message: "Failed to create music entities" },
            { status: 500 }
        );
    }
}
