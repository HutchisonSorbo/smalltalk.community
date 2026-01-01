import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateAccountTypeSchema = z.object({
    accountType: z.string(),
    accountTypeSpecification: z.string().nullable().optional(),
});

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const json = await request.json();
        const parsed = updateAccountTypeSchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid data", errors: parsed.error.errors },
                { status: 400 }
            );
        }

        await db
            .update(users)
            .set({
                accountType: parsed.data.accountType,
                accountTypeSpecification: parsed.data.accountTypeSpecification,
                // We don't mark onboardingCompleted here, as there is another step (Apps)
            })
            .where(eq(users.id, user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating account type:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
