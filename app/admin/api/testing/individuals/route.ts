import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

// Input validation schema
const createIndividualsSchema = z.object({
    count: z.number().min(1).max(10),
    ageGroup: z.enum(["teen", "adult", "senior"])
});

// Australian first names for realistic test data
const FIRST_NAMES = [
    "Oliver", "Charlotte", "Noah", "Amelia", "Jack", "Isla", "William", "Olivia",
    "Henry", "Mia", "Thomas", "Ava", "James", "Grace", "Lucas", "Sophie",
    "Ethan", "Chloe", "Alexander", "Emily", "Michael", "Ella", "Daniel", "Ruby"
];

// Australian last names
const LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Davis", "Wilson", "Taylor",
    "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia",
    "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall"
];

// Mitchell & Murrindindi Shire locations
const LOCATIONS = [
    "Kilmore, VIC 3764",
    "Broadford, VIC 3658",
    "Seymour, VIC 3660",
    "Yea, VIC 3717",
    "Alexandra, VIC 3714",
    "Marysville, VIC 3779",
    "Wallan, VIC 3756",
    "Kinglake, VIC 3763",
    "Eildon, VIC 3713",
    "Healesville, VIC 3777"
];

// Generate random date of birth based on age group
function generateDob(ageGroup: string): Date {
    const now = new Date();
    let minAge: number, maxAge: number;

    switch (ageGroup) {
        case "teen":
            minAge = 13;
            maxAge = 17;
            break;
        case "senior":
            minAge = 65;
            maxAge = 80;
            break;
        default: // adult
            minAge = 18;
            maxAge = 64;
    }

    const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
    const dob = new Date(now.getFullYear() - age, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    return dob;
}

function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * POST /admin/api/testing/individuals - Create test individual accounts
 */
export async function POST(request: Request) {
    try {
        const admin = await requireAdmin();

        const json = await request.json();
        const parsed = createIndividualsSchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid input", errors: parsed.error.errors },
                { status: 400 }
            );
        }

        const { count, ageGroup } = parsed.data;
        const createdEmails: string[] = [];

        for (let i = 0; i < count; i++) {
            const uuid = uuidv4().slice(0, 8);
            const email = `test-${uuid}@smalltalk.test`;
            const firstName = randomChoice(FIRST_NAMES);
            const lastName = randomChoice(LAST_NAMES);
            const location = randomChoice(LOCATIONS);
            const dob = generateDob(ageGroup);

            try {
                await db.insert(users).values({
                    id: uuidv4(),
                    email,
                    firstName,
                    lastName,
                    dateOfBirth: dob,
                    userType: 'individual',
                    accountType: 'Individual',
                    onboardingCompleted: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                createdEmails.push(email);
            } catch (err) {
                console.error(`Failed to create test user ${email}:`, err);
            }
        }

        // Log the action
        console.log(`[Admin Test Create] Admin ${admin.email} created ${createdEmails.length} test individuals:`, createdEmails);

        return NextResponse.json({
            success: true,
            created: createdEmails,
            count: createdEmails.length
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating test individuals:", error);

        // Handle auth redirect
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }

        return NextResponse.json(
            { message: "Failed to create test individuals" },
            { status: 500 }
        );
    }
}
