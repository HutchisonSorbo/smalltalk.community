import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// CORS Headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
};

/**
 * Handle OPTIONS requests for CORS preflight
 * @returns {Promise<NextResponse>} 204 response with CORS headers
 */
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}

/**
 * Fetch the authenticated user's profile data
 * @returns {Promise<NextResponse>} JSON response with user profile or error
 * 
 * @example
 * // Success response (200)
 * { user: { id, email, firstName, lastName, profileImageUrl, dateOfBirth, accountType, userType, ... } }
 * 
 * // Error responses
 * { error: "Unauthorized" } // 401 - Not authenticated
 * { error: "User not found" } // 404 - User record missing
 * { error: "Failed to fetch profile" } // 500 - Server error
 */
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            );
        }

        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        // Return user profile data (excluding sensitive fields)
        return NextResponse.json({
            user: {
                id: dbUser.id,
                email: dbUser.email,
                firstName: dbUser.firstName,
                lastName: dbUser.lastName,
                profileImageUrl: dbUser.profileImageUrl,
                dateOfBirth: dbUser.dateOfBirth,
                accountType: dbUser.accountType,
                userType: dbUser.userType,
                onboardingCompleted: dbUser.onboardingCompleted,
                onboardingStep: dbUser.onboardingStep,
                profileCompletionPercentage: dbUser.profileCompletionPercentage,
                isMinor: dbUser.isMinor,
                createdAt: dbUser.createdAt,
            }
        }, { status: 200, headers: corsHeaders });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500, headers: corsHeaders }
        );
    }
}
