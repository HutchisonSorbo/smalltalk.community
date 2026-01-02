import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { volunteerRoles, organisations } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET - List volunteer opportunities (public, only published)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get("orgId");
        const roleType = searchParams.get("roleType");
        const locationType = searchParams.get("locationType");

        // Fetch roles with organisation data
        const roles = await db
            .select({
                id: volunteerRoles.id,
                organisationId: volunteerRoles.organisationId,
                title: volunteerRoles.title,
                description: volunteerRoles.description,
                roleType: volunteerRoles.roleType,
                locationType: volunteerRoles.locationType,
                address: volunteerRoles.address,
                status: volunteerRoles.status,
                createdAt: volunteerRoles.createdAt,
                orgName: organisations.name,
                orgLogo: organisations.logoUrl,
                orgVerified: organisations.isVerified,
            })
            .from(volunteerRoles)
            .leftJoin(organisations, eq(volunteerRoles.organisationId, organisations.id))
            .where(eq(volunteerRoles.status, "published"))
            .orderBy(desc(volunteerRoles.createdAt));

        // Apply filters
        let filtered = roles;

        if (orgId) {
            filtered = filtered.filter(r => r.organisationId === orgId);
        }

        if (roleType) {
            filtered = filtered.filter(r => r.roleType === roleType);
        }

        if (locationType) {
            filtered = filtered.filter(r => r.locationType === locationType);
        }

        return NextResponse.json({ roles: filtered }, { status: 200 });
    } catch (error) {
        console.error("Error fetching volunteer roles:", error);
        return NextResponse.json(
            { error: "Failed to fetch roles" },
            { status: 500 }
        );
    }
}
