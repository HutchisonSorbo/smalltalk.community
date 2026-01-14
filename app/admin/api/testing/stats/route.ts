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
        const testOrgPattern = 'Test Org -%';

        // Helper to safely count from a table
        const safeCount = async (queryFn: () => Promise<{ count: string }[] | unknown>, tableName?: string) => {
            try {
                const result = await queryFn() as any[];
                if (Array.isArray(result) && result.length > 0) {
                    return parseInt(result[0].count, 10) || 0;
                }
                return 0;
            } catch (error) {
                console.error(`[Stats] Error counting ${tableName || 'unknown table'}:`, error);
                return 0;
            }
        };

        const [
            individuals,
            musicians,
            professionals,
            gigsCount,
            bandsCount,
            organisations,
            opportunities
        ] = await Promise.all([
            safeCount(() => db.execute(sql`
                SELECT COUNT(*) as count FROM users 
                WHERE email LIKE ${testEmailPattern}
            `), 'users'),
            safeCount(() => db.execute(sql`
                SELECT COUNT(*) as count FROM musician_profiles 
                WHERE user_id IN (SELECT id FROM users WHERE email LIKE ${testEmailPattern})
            `), 'musician_profiles'),
            safeCount(() => db.execute(sql`
                SELECT COUNT(*) as count FROM professional_profiles 
                WHERE user_id IN (SELECT id FROM users WHERE email LIKE ${testEmailPattern})
            `), 'professional_profiles'),
            safeCount(() => db.execute(sql`
                SELECT COUNT(*) as count FROM gigs 
                WHERE creator_id IN (SELECT id FROM users WHERE email LIKE ${testEmailPattern})
            `), 'gigs'),
            safeCount(() => db.execute(sql`
                SELECT COUNT(*) as count FROM bands 
                WHERE user_id IN (SELECT id FROM users WHERE email LIKE ${testEmailPattern})
            `), 'bands'),
            safeCount(() => db.execute(sql`
                SELECT COUNT(*) as count FROM organisations 
                WHERE name LIKE ${testOrgPattern}
            `), 'organisations'),
            safeCount(() => db.execute(sql`
                SELECT COUNT(*) as count FROM volunteer_opportunities 
                WHERE organisation_id IN (
                    SELECT id FROM organisations WHERE name LIKE ${testOrgPattern}
                )
            `), 'volunteer_opportunities')
        ]);

        return NextResponse.json({
            individuals,
            organisations,
            opportunities,
            musicians,
            professionals,
            gigs: gigsCount,
            bands: bandsCount
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
