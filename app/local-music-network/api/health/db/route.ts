
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        console.log("Database Health Check: Starting...");

        // Log the sanitized URL to check format (masking password)
        const dbUrl = process.env.DATABASE_URL || "NOT_SET";
        const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":***@");
        console.log("Database URL (Masked):", maskedUrl);

        // Attempt a simple query
        const start = Date.now();
        const result = await db.execute(sql`SELECT NOW() as time`);
        const duration = Date.now() - start;

        console.log("Database Health Check: Success", result);

        return NextResponse.json({
            status: "ok",
            message: "Database connection successful",
            timestamp: result[0]?.time,
            latency: `${duration}ms`,
            config: {
                url_masked: maskedUrl
            }
        });

    } catch (error: any) {
        console.error("Database Health Check: Failed", error);

        return NextResponse.json({
            status: "error",
            message: "Database connection failed",
            error: error.message,
            code: error.code || "UNKNOWN",
            details: error.toString()
        }, { status: 500 });
    }
}
