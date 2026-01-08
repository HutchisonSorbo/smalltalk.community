import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { inArray } from "drizzle-orm";
import { verifyAdminRequest, logAdminAction, AdminActions, TargetTypes, BulkExportSchema } from "@/lib/admin-utils";

function objectToCSV(data: Record<string, unknown>[]): string {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
        headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return "";
            if (typeof value === "object") return JSON.stringify(value);
            const strValue = String(value);
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            if (strValue.includes(",") || strValue.includes('"') || strValue.includes("\n")) {
                return `"${strValue.replace(/"/g, '""')}"`;
            }
            return strValue;
        }).join(",")
    );

    return [headers.join(","), ...rows].join("\n");
}

// POST /api/admin/users/bulk/export - Export selected users
export async function POST(request: NextRequest) {
    const { authorized, adminId } = await verifyAdminRequest();
    if (!authorized || !adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Validate input with Zod
        const validation = BulkExportSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0]?.message || "Invalid input" },
                { status: 400 }
            );
        }

        const { userIds, format } = validation.data;

        // Fetch selected users
        const selectedUsers = await db
            .select({
                id: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                accountType: users.accountType,
                isAdmin: users.isAdmin,
                isMinor: users.isMinor,
                onboardingCompleted: users.onboardingCompleted,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(inArray(users.id, userIds));

        // Log the export
        await logAdminAction({
            adminId,
            action: AdminActions.EXPORT_DATA,
            targetType: TargetTypes.USER,
            targetId: `bulk-${userIds.length}`,
            details: { format, userCount: selectedUsers.length, userIds },
        });

        if (format === "json") {
            return new NextResponse(JSON.stringify(selectedUsers, null, 2), {
                headers: {
                    "Content-Type": "application/json",
                    "Content-Disposition": `attachment; filename="users_export_${new Date().toISOString().split("T")[0]}.json"`,
                },
            });
        }

        // Default to CSV
        const csv = objectToCSV(selectedUsers as Record<string, unknown>[]);
        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="users_export_${new Date().toISOString().split("T")[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error("[Admin API] Bulk export error:", error);
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
}
