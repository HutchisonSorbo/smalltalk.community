import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/server/db";
import { users, musicianProfiles, professionalProfiles, gigs, bands } from "@shared/schema";
import { sql, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /admin/api/testing/stats - Get counts of test data across tables
 */
export async function GET() {
    try {
        await requireAdmin();

        // Count test data across all relevant tables
        // Note: Since isTestData column may not exist yet, we count by test email pattern
        const testEmailPattern = '%@smalltalk.test';

        const [
            individualsResult,
            musiciansResult,
            professionalsResult,
            gigsResult,
            bandsResult
        ] = await Promise.all([
            db.execute(sql`
                SELECT COUNT(*) as count FROM users 
                WHERE email LIKE ${testEmailPattern}
            `),
            db.execute(sql`
                SELECT COUNT(*) as count FROM musician_profiles 
                WHERE user_id IN (SELECT id FROM users WHERE email LIKE ${testEmailPattern})
            `),
            db.execute(sql`
                SELECT COUNT(*) as count FROM professional_profiles 
                WHERE user_id IN (SELECT id FROM users WHERE email LIKE ${testEmailPattern})
            `),
            db.execute(sql`
                SELECT COUNT(*) as count FROM gigs 
                WHERE creator_id IN (SELECT id FROM users WHERE email LIKE ${testEmailPattern})
            `),
            db.execute(sql`
                SELECT COUNT(*) as count FROM bands 
                WHERE user_id IN (SELECT id FROM users WHERE email LIKE ${testEmailPattern})
            `)
        ]);

        // Extract counts from results
        const getCount = (result: any) => {
            if (Array.isArray(result) && result.length > 0) {
                return parseInt(result[0].count) || 0;
            }
            return 0;
        };

        return NextResponse.json({
            individuals: getCount(individualsResult),
            organisations: 0, // Will add when organisations table exists
            opportunities: 0, // Will aggregate from multiple tables
            musicians: getCount(musiciansResult),
            professionals: getCount(professionalsResult),
            gigs: getCount(gigsResult),
            bands: getCount(bandsResult)
        });

    } catch (error) {
        console.error("Error fetching test stats:", error);

        // Handle auth redirect
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }

        return NextResponse.json(
            { message: "Failed to fetch test statistics" },
            { status: 500 }
        );
    }
}
