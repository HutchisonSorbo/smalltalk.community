
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        console.log("Database Health Check: Starting...");

        // Attempt a simple query
        const start = Date.now();
        const result = await db.execute(sql`SELECT NOW() as time`);
        const duration = Date.now() - start;

        console.log("Database Health Check: Success", result);

        return NextResponse.json({
            status: "ok",
            timestamp: result[0]?.time,
        });

    } catch (error: any) {
        console.error("Database Health Check: Failed"); // Don't log full error object to stdout if sensitive

        return NextResponse.json({
            status: "error",
            message: "Database connection failed",
        }, { status: 500 });
    }
}
