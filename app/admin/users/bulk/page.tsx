import { db } from "@/server/db";
import { users } from "@shared/schema";
import { desc, count } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Users } from "lucide-react";
import { BulkActionsClient } from "./bulk-actions-client";

async function getUsers() {
    try {
        // Fetch all users (up to 500 for bulk actions)
        const [allUsers, totalCount] = await Promise.all([
            db
                .select({
                    id: users.id,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    email: users.email,
                    profileImageUrl: users.profileImageUrl,
                    accountType: users.accountType,
                    isAdmin: users.isAdmin,
                    onboardingCompleted: users.onboardingCompleted,
                    createdAt: users.createdAt,
                })
                .from(users)
                .orderBy(desc(users.createdAt))
                .limit(500),
            db.select({ count: count() }).from(users),
        ]);

        return {
            users: allUsers,
            total: totalCount[0]?.count ?? 0,
            error: null,
        };
    } catch (error) {
        console.error("[Admin Bulk Actions] Error fetching users:", error);
        return {
            users: [],
            total: 0,
            error: error instanceof Error ? error.message : "Failed to load users",
        };
    }
}

export default async function BulkActionsPage() {
    const { users: allUsers, total, error } = await getUsers();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Bulk User Actions</h1>
                <p className="text-muted-foreground">Perform actions on multiple users at once</p>
            </div>

            {/* Error Alert */}
            {error && (
                <Card className="border-red-500/50 bg-red-500/10">
                    <CardContent className="flex items-center gap-3 py-4">
                        <Users className="h-5 w-5 text-red-600" />
                        <div>
                            <p className="font-medium text-red-700">Failed to load users</p>
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Warning */}
            <Card className="border-yellow-500/50 bg-yellow-500/5">
                <CardContent className="flex items-center gap-4 py-4">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    <div>
                        <p className="font-medium text-yellow-700">Bulk actions are irreversible</p>
                        <p className="text-sm text-yellow-600">
                            Please review your selection carefully before proceeding. Admin users cannot be selected.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Client-side bulk actions component */}
            <BulkActionsClient users={allUsers} total={total} />
        </div>
    );
}
