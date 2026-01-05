import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/server/db";
import { users, organisations, organisationMembers } from "@shared/schema";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";

export const dynamic = "force-dynamic";

// Input validation schema
const createOrganisationsSchema = z.object({
    count: z.number().min(1).max(5),
    orgType: z.enum(["Business", "Charity", "Government Organisation", "Community Group"])
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

const ORG_PREFIXES = {
    "Business": ["Cafe", "Bakery", "Motors", "Plumbing", "Farms", "Winery", "Consulting", "Retail"],
    "Charity": ["Foundation", "Aid", "Support", "Care", "Trust", "Mission"],
    "Government Organisation": ["Council Services", "Library", "Community Centre", "Health Service"],
    "Community Group": ["Sports Club", "Arts Group", "Youth Club", "Gardening Club", "Historical Society"]
};

function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * POST /admin/api/testing/organisations - Create test organisation profiles and users
 */
export async function POST(request: Request) {
    try {
        const admin = await requireAdmin();

        const json = await request.json();
        const parsed = createOrganisationsSchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid input", errors: parsed.error.errors },
                { status: 400 }
            );
        }

        const { count, orgType } = parsed.data;
        const createdNames: string[] = [];

        for (let i = 0; i < count; i++) {
            const uuid = uuidv4();
            const shortId = uuid.slice(0, 8);

            // Generate realistic name
            const prefixes = ORG_PREFIXES[orgType as keyof typeof ORG_PREFIXES] || ORG_PREFIXES["Business"];
            const prefix = randomChoice(prefixes);
            const location = randomChoice(LOCATIONS);
            const locationName = location.split(',')[0];
            const name = `Test Org - ${locationName} ${prefix} ${shortId}`;
            const slug = slugify(name, { lower: true, strict: true });

            // Create Admin User for the Organisation
            const email = `test-org-${shortId}@smalltalk.test`;

            try {
                // 1. Create User
                const userId = uuidv4();
                await db.insert(users).values({
                    id: userId,
                    email,
                    displayName: `${name} Admin`,
                    firstName: "Test",
                    lastName: "Admin",
                    userType: 'individual', // The user is an individual managing an org
                    accountType: 'Individual', // Their personal account is individual
                    location,
                    onboardingCompleted: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                // 2. Create Organisation
                const orgId = uuidv4();
                await db.insert(organisations).values({
                    id: orgId,
                    name,
                    slug,
                    description: `This is a test organisation of type ${orgType} located in ${location}. Created for end-to-end testing.`,
                    abn: "12 345 678 901", // Dummy ABN
                    isVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                // 3. Link via OrganisationMember
                await db.insert(organisationMembers).values({
                    id: uuidv4(),
                    organisationId: orgId,
                    userId: userId,
                    role: 'admin',
                    createdAt: new Date()
                });

                createdNames.push(name);
            } catch (err) {
                console.error(`Failed to create test organisation ${name}:`, err);
            }
        }

        // Log the action
        console.log(`[Admin Test Create] Admin ${admin.email} created ${createdNames.length} test organisations:`, createdNames);

        return NextResponse.json({
            success: true,
            created: createdNames,
            count: createdNames.length
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating test organisations:", error);

        // Handle auth redirect
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }

        return NextResponse.json(
            { message: "Failed to create test organisations" },
            { status: 500 }
        );
    }
}
