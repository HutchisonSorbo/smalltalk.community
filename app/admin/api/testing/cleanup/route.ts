import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/server/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * DELETE /admin/api/testing/cleanup - Delete all test data
 * 
 * Deletes all entities with test email pattern (@smalltalk.test)
 * Cascades to related tables via foreign key constraints
 */
export async function DELETE() {
    try {
        const admin = await requireAdmin();

        const testEmailPattern = '%@smalltalk.test';
        let totalDeleted = 0;

        // Delete in order to respect foreign key constraints:
        // 1. First delete gigs (references bands and musicians)
        // 2. Then delete bands (references users)
        // 3. Then delete musicians/professionals (references users)
        // 4. Finally delete users

        // Delete gigs created by test users
        const gigsResult = await db.execute(sql`
            DELETE FROM gigs 
            WHERE creator_id IN (SELECT id FROM users WHERE email LIKE ${testEmailPattern})
            RETURNING id
        `);
        const gigsDeleted = Array.isArray(gigsResult) ? gigsResult.length : 0;
        totalDeleted += gigsDeleted;

        // Delete bands owned by test users
        const bandsResult = await db.execute(sql`
            DELETE FROM bands 
            WHERE user_id IN (SELECT id FROM users WHERE email LIKE ${testEmailPattern})
            RETURNING id
        `);
        const bandsDeleted = Array.isArray(bandsResult) ? bandsResult.length : 0;
        totalDeleted += bandsDeleted;

        // Delete musician profiles owned by test users
        const musiciansResult = await db.execute(sql`
            DELETE FROM musician_profiles 
            WHERE user_id IN (SELECT id FROM users WHERE email LIKE ${testEmailPattern})
            RETURNING id
        `);
        const musiciansDeleted = Array.isArray(musiciansResult) ? musiciansResult.length : 0;
        totalDeleted += musiciansDeleted;

        // Delete professional profiles owned by test users
        const professionalsResult = await db.execute(sql`
            DELETE FROM professional_profiles 
            WHERE user_id IN (SELECT id FROM users WHERE email LIKE ${testEmailPattern})
            RETURNING id
        `);
        const professionalsDeleted = Array.isArray(professionalsResult) ? professionalsResult.length : 0;
        totalDeleted += professionalsDeleted;

        // Finally, delete test users themselves
        const usersResult = await db.execute(sql`
            DELETE FROM users 
            WHERE email LIKE ${testEmailPattern}
            RETURNING id
        `);
        const usersDeleted = Array.isArray(usersResult) ? usersResult.length : 0;
        totalDeleted += usersDeleted;

        // Log the cleanup action
        console.log(`[Admin Test Cleanup] Admin ${admin.email} deleted ${totalDeleted} test entities:`, {
            gigs: gigsDeleted,
            bands: bandsDeleted,
            musicians: musiciansDeleted,
            professionals: professionalsDeleted,
            users: usersDeleted
        });

        return NextResponse.json({
            success: true,
            deleted: totalDeleted,
            breakdown: {
                gigs: gigsDeleted,
                bands: bandsDeleted,
                musicians: musiciansDeleted,
                professionals: professionalsDeleted,
                users: usersDeleted
            }
        });

    } catch (error) {
        console.error("Error during test data cleanup:", error);

        // Handle auth redirect
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }

        return NextResponse.json(
            { message: "Failed to cleanup test data" },
            { status: 500 }
        );
    }
}
