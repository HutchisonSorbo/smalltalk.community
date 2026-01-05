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
        // 2. Delete volunteer_opportunities (references organisations)
        // 3. Then delete bands (references users)
        // 4. Delete organisation_members (references users and organisations)
        // 5. Delete organisations 
        // 6. Then delete musicians/professionals (references users)
        // 7. Finally delete users

        // Delete gigs created by test users
        const gigsResult = await db.execute(sql`
            DELETE FROM gigs 
            WHERE creator_id IN (SELECT id FROM users WHERE email LIKE ${testEmailPattern})
            RETURNING id
        `);
        const gigsDeleted = Array.isArray(gigsResult) ? gigsResult.length : 0;
        totalDeleted += gigsDeleted;

        // Delete volunteer opportunities created by test organisations
        let volunteerOppsDeleted = 0;
        try {
            const volunteerOppsResult = await db.execute(sql`
                DELETE FROM volunteer_opportunities 
                WHERE organisation_id IN (
                    SELECT om.organisation_id FROM organisation_members om 
                    JOIN users u ON om.user_id = u.id 
                    WHERE u.email LIKE ${testEmailPattern}
                )
                RETURNING id
            `);
            volunteerOppsDeleted = Array.isArray(volunteerOppsResult) ? volunteerOppsResult.length : 0;
            totalDeleted += volunteerOppsDeleted;
        } catch (e) {
            // Table may not exist yet
            console.log("[Cleanup] volunteer_opportunities table not found, skipping");
        }

        // Delete bands owned by test users
        const bandsResult = await db.execute(sql`
            DELETE FROM bands 
            WHERE user_id IN (SELECT id FROM users WHERE email LIKE ${testEmailPattern})
            RETURNING id
        `);
        const bandsDeleted = Array.isArray(bandsResult) ? bandsResult.length : 0;
        totalDeleted += bandsDeleted;

        // Delete organisation_members for test users
        let orgMembersDeleted = 0;
        try {
            const orgMembersResult = await db.execute(sql`
                DELETE FROM organisation_members 
                WHERE user_id IN (SELECT id FROM users WHERE email LIKE ${testEmailPattern})
                RETURNING id
            `);
            orgMembersDeleted = Array.isArray(orgMembersResult) ? orgMembersResult.length : 0;
            totalDeleted += orgMembersDeleted;
        } catch (e: any) {
            console.log("[Cleanup] Error deleting organisation_members:", e?.message || e);
        }

        // Delete volunteer_roles for test organisations (must be before organisations)
        let volunteerRolesDeleted = 0;
        try {
            const volunteerRolesResult = await db.execute(sql`
                DELETE FROM volunteer_roles 
                WHERE organisation_id IN (
                    SELECT id FROM organisations WHERE name LIKE 'Test Org -%'
                )
                RETURNING id
            `);
            volunteerRolesDeleted = Array.isArray(volunteerRolesResult) ? volunteerRolesResult.length : 0;
            totalDeleted += volunteerRolesDeleted;
        } catch (e: any) {
            console.log("[Cleanup] Error deleting volunteer_roles:", e?.message || e);
        }

        // Delete organisations created by test users (via membership admin role)
        let organisationsDeleted = 0;
        try {
            // Get org IDs that were created by test users before we deleted the membership links
            const orgsResult = await db.execute(sql`
                DELETE FROM organisations 
                WHERE name LIKE 'Test Org -%'
                RETURNING id
            `);
            organisationsDeleted = Array.isArray(orgsResult) ? orgsResult.length : 0;
            totalDeleted += organisationsDeleted;
        } catch (e: any) {
            console.log("[Cleanup] Error deleting organisations:", e?.message || e);
        }

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
            volunteerOpps: volunteerOppsDeleted,
            volunteerRoles: volunteerRolesDeleted,
            bands: bandsDeleted,
            orgMembers: orgMembersDeleted,
            organisations: organisationsDeleted,
            musicians: musiciansDeleted,
            professionals: professionalsDeleted,
            users: usersDeleted
        });

        return NextResponse.json({
            success: true,
            deleted: totalDeleted,
            breakdown: {
                gigs: gigsDeleted,
                volunteerOpps: volunteerOppsDeleted,
                volunteerRoles: volunteerRolesDeleted,
                bands: bandsDeleted,
                orgMembers: orgMembersDeleted,
                organisations: organisationsDeleted,
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
