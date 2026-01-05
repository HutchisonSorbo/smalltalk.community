import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/server/db";
import { users, organisations, volunteerRoles, gigs } from "@shared/schema";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Input validation schema
const createOpportunitiesSchema = z.object({
    count: z.number().min(1).max(10),
    type: z.enum(["volunteer", "gig"])
});

// Mitchell & Murrindindi Shire locations
const LOCATIONS = [
    "Kilmore, VIC 3764",
    "Broadford, VIC 3658",
    "Seymour, VIC 3660",
    "Yea, VIC 3717",
    "Alexandra, VIC 3714",
    "Marysville, VIC 3779",
    "Wallan, VIC 3756",
    "Kinglake, VIC 3763"
];

// Volunteer Role Data
const ROLE_TITLES = [
    "Community Garden Helper",
    "Op Shop Assistant",
    "Event Marshall",
    "Youth Mentor",
    "Driver for Elderly",
    "Administrative Support",
    "Social Media Volunteer",
    "Fundraising Coordinator",
    "Animal Shelter Assistant",
    "Reading Buddy"
];

const ROLE_TYPES = ["ongoing", "one_off", "event_based"];
const LOCATION_TYPES = ["on_site", "remote", "hybrid"];

// Gig Data
const GIG_TITLES = [
    "Acoustic Sunday Session",
    "Friday Night Live",
    "Community Concert",
    "Pub Rock Night",
    "Jazz in the Park",
    "Open Mic Night",
    "Band Showcase",
    "Folk Festival Set"
];

const GENRES = ["Rock", "Acoustic", "Jazz", "Folk", "Blues", "Pop", "Country"];

function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * POST /admin/api/testing/opportunities - Create test opportunities
 */
export async function POST(request: Request) {
    try {
        const admin = await requireAdmin();

        const json = await request.json();
        const parsed = createOpportunitiesSchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid input", errors: parsed.error.errors },
                { status: 400 }
            );
        }

        const { count, type } = parsed.data;
        const createdItems: string[] = [];
        const testEmailPattern = '%@smalltalk.test';

        if (type === "volunteer") {
            // Get test organisations
            const testOrgs = await db.select({ id: organisations.id, name: organisations.name })
                .from(organisations)
                .where(sql`name LIKE 'Test Org - %'`)
                .limit(50); // Get a batch to pick from

            if (testOrgs.length === 0) {
                return NextResponse.json(
                    { message: "No test organisations found. Please create test organisations first." },
                    { status: 400 }
                );
            }

            for (let i = 0; i < count; i++) {
                const org = randomChoice(testOrgs);
                const title = randomChoice(ROLE_TITLES);
                const location = randomChoice(LOCATIONS);

                try {
                    await db.insert(volunteerRoles).values({
                        id: uuidv4(),
                        organisationId: org.id,
                        title: `${title} - ${org.name}`, // Varied title
                        description: `This is a test volunteer role for ${org.name}. We are looking for help with ${title.toLowerCase()} activities in the ${location} area. This request was generated for end-to-end testing purposes.`,
                        roleType: randomChoice(ROLE_TYPES),
                        locationType: randomChoice(LOCATION_TYPES),
                        address: location,
                        status: 'published',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    createdItems.push(`${title} (${org.name})`);
                } catch (e) {
                    console.error("Error creating volunteer role", e);
                }
            }
        } else if (type === "gig") {
            // Get test users
            const testUsers = await db.select({ id: users.id, displayName: users.displayName })
                .from(users)
                .where(sql`email LIKE ${testEmailPattern}`)
                .limit(50);

            if (testUsers.length === 0) {
                return NextResponse.json(
                    { message: "No test users found. Please create test individuals first." },
                    { status: 400 }
                );
            }

            for (let i = 0; i < count; i++) {
                const user = randomChoice(testUsers);
                const title = randomChoice(GIG_TITLES);
                const location = randomChoice(LOCATIONS);
                const date = randomDate(new Date(), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)); // Next 90 days

                try {
                    await db.insert(gigs).values({
                        id: uuidv4(),
                        creatorId: user.id,
                        title: `${title} at ${location.split(',')[0]}`,
                        description: `A test gig created by ${user.displayName}. Performers include local talent. Come along for a great time!`,
                        location: location,
                        date: date,
                        price: Math.floor(Math.random() * 5000), // 0 to $50.00
                        genre: randomChoice(GENRES),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    createdItems.push(`${title} (${location.split(',')[0]})`);
                } catch (e) {
                    console.error("Error creating gig", e);
                }
            }
        }

        console.log(`[Admin Test Create] Admin ${admin.email} created ${createdItems.length} ${type} opportunities`);

        return NextResponse.json({
            success: true,
            created: createdItems,
            count: createdItems.length
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating test opportunities:", error);

        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }

        return NextResponse.json(
            { message: "Failed to create test opportunities" },
            { status: 500 }
        );
    }
}
