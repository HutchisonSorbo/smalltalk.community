import { NextResponse } from "next/server";
import { registerSchema } from "../../../../lib/onboarding-schemas";
import { createClient } from "@supabase/supabase-js";
import { db } from "../../../../server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

import { checkRateLimit } from "../../../../lib/rate-limiter";

// Initialize Supabase Admin Client
// We need admin rights to ensure we can create users and link them correctly, or simply use public key?
// Using standard client to emulate sign-up is safer for "register" usually, but we need to ensure we can write to public.users?
// If RLS allows "insert own", we need to be authenticated?
// But "register" happens BEFORE authentication.
// So we probably need to use SERVICE_ROLE key here to insert into public.users on behalf of the new user.

export async function POST(req: Request) {
    try {
        // 0. Rate Limiting Check
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const isAllowed = await checkRateLimit(ip, "register", 3, 3600); // 3 attempts per hour per IP

        if (!isAllowed) {
            return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, { status: 429 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const body = await req.json();

        // 1. Validate Input
        const result = registerSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 });
        }

        const { email, password, firstName, lastName, dateOfBirth, accountType, accountTypeSpecification, organisationName, userType } = result.data;

        // 2. Calculate Age / Minor Status
        let isMinor = false;
        let age = 0;

        if (accountType === 'Individual' && dateOfBirth) {
            const dob = new Date(dateOfBirth);
            const today = new Date();
            age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }

            // Enforce 13+ minimum age requirement
            if (age < 13) {
                return NextResponse.json({
                    error: "You must be at least 13 years old to create an account"
                }, { status: 400 });
            }

            if (age < 18) {
                isMinor = true;
            }
        }

        // 3. Check if user already exists in public.users (Validation)
        // Supabase Auth handles unique email, but checking here saves an API call to Supabase if local DB is sync'd
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1).then(res => res[0]);

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        // 4. Create User in Supabase Auth
        console.log("Attempting Supabase SignUp for new user");
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    account_type: accountType,
                }
            }
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        if (!authData.user) {
            return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
        }

        const userId = authData.user.id;

        // 5. Insert into public.users (using Service Role via 'db' which presumably has admin access or RLS override?)
        // 'db' from server/db.ts usually uses connection string. If connection string is postgres://postgres..., it's admin.
        // If it uses transaction pooler, we assume it has rights.

        await db.insert(users).values({
            id: userId,
            email: email,
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            userType: userType || 'individual', // Default
            accountType: accountType,
            accountTypeSpecification: accountTypeSpecification,
            organisationName: organisationName,
            isMinor: isMinor,
            onboardingStep: 0,
            profileCompletionPercentage: 10, // Account created = 10%
            onboardingCompleted: false,
        }).onConflictDoUpdate({
            target: users.id,
            set: {
                firstName: firstName,
                lastName: lastName,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                userType: userType || 'individual',
                accountType: accountType,
                accountTypeSpecification: accountTypeSpecification,
                organisationName: organisationName,
                isMinor: isMinor,
                onboardingStep: 0,
                profileCompletionPercentage: 10,
                onboardingCompleted: false,
            }
        });

        // 6. Return Success
        return NextResponse.json({
            success: true,
            message: "Account created successfully",
            user: { id: userId, email, isMinor }
        });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
