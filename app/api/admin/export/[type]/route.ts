import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { db } from "@/server/db";
import {
    users,
    musicianProfiles,
    bands,
    bandMembers,
    gigs,
    volunteerProfiles,
    organisations,
    organisationMembers,
    adminActivityLog,
    userPrivacySettings,
    userNotificationPreferences,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { logAdminAction, AdminActions, TargetTypes } from "@/lib/admin-utils";

async function verifyAdmin() {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return { authorized: false, adminId: null };
        }

        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });

        if (!dbUser || !dbUser.isAdmin) {
            return { authorized: false, adminId: null };
        }

        return { authorized: true, adminId: user.id };
    } catch (error) {
        console.error("[Admin API] Auth verification error:", error);
        return { authorized: false, adminId: null };
    }
}

function objectToCSV(data: Record<string, unknown>[]): string {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
        headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return "";
            if (typeof value === "object") return JSON.stringify(value);
            return String(value).includes(",") ? `"${value}"` : String(value);
        }).join(",")
    );

    return [headers.join(","), ...rows].join("\n");
}

// GET /api/admin/export/[type] - Export data
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ type: string }> }
) {
    const { authorized, adminId } = await verifyAdmin();
    if (!authorized || !adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type } = await params;
    const format = request.nextUrl.searchParams.get("format") || "json";

    try {
        let data: Record<string, unknown>[] = [];

        switch (type) {
            case "users":
                data = await db.select().from(users).orderBy(desc(users.createdAt));
                break;
            case "musicians":
                data = await db.select().from(musicianProfiles);
                break;
            case "bands":
                const bandsData = await db.select().from(bands);
                data = bandsData as Record<string, unknown>[];
                break;
            case "gigs":
                data = await db.select().from(gigs);
                break;
            case "volunteers":
                data = await db.select().from(volunteerProfiles);
                break;
            case "organisations":
                data = await db.select().from(organisations);
                break;
            case "activity_log":
                data = await db.select().from(adminActivityLog).orderBy(desc(adminActivityLog.createdAt));
                break;
            default:
                return NextResponse.json({ error: "Unknown export type" }, { status: 400 });
        }

        // Log the export
        await logAdminAction({
            adminId,
            action: AdminActions.EXPORT_DATA,
            targetType: TargetTypes.SETTING,
            targetId: type,
            details: { format, recordCount: data.length },
        });

        if (format === "csv") {
            const csv = objectToCSV(data);
            return new NextResponse(csv, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="${type}_export.csv"`,
                },
            });
        }

        return new NextResponse(JSON.stringify(data, null, 2), {
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="${type}_export.json"`,
            },
        });
    } catch (error) {
        console.error("[Admin API] Export error:", error);
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
}
