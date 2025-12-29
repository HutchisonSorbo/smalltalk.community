
import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { insertReportSchema } from "@shared/schema";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const json = await request.json();

        // Ensure the reporterId matches the authenticated user
        const reportData = {
            ...json,
            reporterId: user.id
        };

        const validatedData = insertReportSchema.parse(reportData);

        const report = await storage.createReport(validatedData);

        return NextResponse.json(report, { status: 201 });
    } catch (error: any) {
        console.error("Error creating report:", error);
        if (error.name === "ZodError") {
            return NextResponse.json({ message: "Invalid data", errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// CodeRabbit Audit Trigger
