import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { users, userOnboardingResponses } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Auth check
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Admin check
        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });

        if (!dbUser?.isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch all onboarding responses with user data
        const responses = await db
            .select({
                responseId: userOnboardingResponses.id,
                userId: userOnboardingResponses.userId,
                questionKey: userOnboardingResponses.questionKey,
                response: userOnboardingResponses.response,
                responseDate: userOnboardingResponses.createdAt,
                userEmail: users.email,
                userFirstName: users.firstName,
                userLastName: users.lastName,
                accountType: users.accountType,
                userCreatedAt: users.createdAt,
            })
            .from(userOnboardingResponses)
            .leftJoin(users, eq(userOnboardingResponses.userId, users.id))
            .orderBy(desc(userOnboardingResponses.createdAt));

        // Convert to CSV
        const headers = [
            "Response ID",
            "User ID",
            "Email",
            "First Name",
            "Last Name",
            "Account Type",
            "Question Key",
            "Response",
            "Response Date",
            "User Created At",
        ];

        const csvRows = [headers.join(",")];

        for (const row of responses) {
            const values = [
                row.responseId,
                row.userId,
                row.userEmail || "",
                row.userFirstName || "",
                row.userLastName || "",
                row.accountType || "",
                row.questionKey,
                JSON.stringify(row.response).replace(/"/g, '""'), // Escape quotes for CSV
                row.responseDate?.toISOString() || "",
                row.userCreatedAt?.toISOString() || "",
            ];
            csvRows.push(values.map(v => `"${v}"`).join(","));
        }

        const csv = csvRows.join("\n");

        // Return as downloadable file
        const filename = `onboarding-data-${new Date().toISOString().split('T')[0]}.csv`;

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });

    } catch (error) {
        console.error("Error exporting onboarding data:", error);
        return NextResponse.json(
            { error: "Failed to export data" },
            { status: 500 }
        );
    }
}
