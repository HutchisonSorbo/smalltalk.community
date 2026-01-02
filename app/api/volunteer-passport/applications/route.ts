import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { volunteerApplications, volunteerProfiles, volunteerRoles, organisations } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const applicationSchema = z.object({
    roleId: z.string().uuid(),
    coverMessage: z.string().max(2000).optional(),
});

// GET - User's applications
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user's volunteer profile
        const profile = await db.query.volunteerProfiles.findFirst({
            where: eq(volunteerProfiles.userId, user.id),
        });

        if (!profile) {
            return NextResponse.json({ applications: [] }, { status: 200 });
        }

        // Fetch applications with role and org data
        const applications = await db
            .select({
                id: volunteerApplications.id,
                roleId: volunteerApplications.roleId,
                status: volunteerApplications.status,
                coverMessage: volunteerApplications.coverMessage,
                createdAt: volunteerApplications.createdAt,
                updatedAt: volunteerApplications.updatedAt,
                roleTitle: volunteerRoles.title,
                roleType: volunteerRoles.roleType,
                orgName: organisations.name,
                orgLogo: organisations.logoUrl,
            })
            .from(volunteerApplications)
            .leftJoin(volunteerRoles, eq(volunteerApplications.roleId, volunteerRoles.id))
            .leftJoin(organisations, eq(volunteerRoles.organisationId, organisations.id))
            .where(eq(volunteerApplications.applicantId, profile.id))
            .orderBy(desc(volunteerApplications.createdAt));

        return NextResponse.json({ applications }, { status: 200 });
    } catch (error) {
        console.error("Error fetching applications:", error);
        return NextResponse.json(
            { error: "Failed to fetch applications" },
            { status: 500 }
        );
    }
}

// POST - Submit application
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get or check volunteer profile exists
        const profile = await db.query.volunteerProfiles.findFirst({
            where: eq(volunteerProfiles.userId, user.id),
        });

        if (!profile) {
            return NextResponse.json(
                { error: "Please create a volunteer profile first" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const validated = applicationSchema.parse(body);

        // Check role exists and is published
        const role = await db.query.volunteerRoles.findFirst({
            where: eq(volunteerRoles.id, validated.roleId),
        });

        if (!role || role.status !== "published") {
            return NextResponse.json(
                { error: "Role not found or not accepting applications" },
                { status: 404 }
            );
        }

        // Check if already applied
        const existing = await db.query.volunteerApplications.findFirst({
            where: and(
                eq(volunteerApplications.applicantId, profile.id),
                eq(volunteerApplications.roleId, validated.roleId)
            ),
        });

        if (existing) {
            return NextResponse.json(
                { error: "You have already applied to this role" },
                { status: 409 }
            );
        }

        // Create application
        const [application] = await db.insert(volunteerApplications).values({
            roleId: validated.roleId,
            applicantId: profile.id,
            coverMessage: validated.coverMessage,
            status: "submitted",
        }).returning();

        return NextResponse.json({ application }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.errors },
                { status: 400 }
            );
        }
        console.error("Error submitting application:", error);
        return NextResponse.json(
            { error: "Failed to submit application" },
            { status: 500 }
        );
    }
}
