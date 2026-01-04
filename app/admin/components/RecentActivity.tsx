
import { db } from "@/server/db";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { adminActivityLog, users } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getRecentActivity = unstable_cache(
    async () => {
        try {
            const logs = await db
                .select({
                    id: adminActivityLog.id,
                    action: adminActivityLog.action,
                    targetType: adminActivityLog.targetType,
                    targetId: adminActivityLog.targetId,
                    createdAt: adminActivityLog.createdAt,
                    adminFirstName: users.firstName,
                    adminLastName: users.lastName,
                    adminEmail: users.email,
                    adminImage: users.profileImageUrl,
                })
                .from(adminActivityLog)
                .leftJoin(users, eq(adminActivityLog.adminId, users.id))
                .orderBy(desc(adminActivityLog.createdAt))
                .limit(5);

            return logs;
        } catch (error) {
            console.error("[Admin Dashboard] Error fetching activity:", error);
            return [];
        }
    },
    [CACHE_TAGS.ADMIN_RECENT_ACTIVITY],
    { revalidate: 60 }
);

function formatAction(action: string): string {
    const parts = action.split(".");
    if (parts.length === 2) {
        return `${parts[1].replace(/_/g, " ")} ${parts[0]}`;
    }
    return action.replace(/_/g, " ");
}

export async function RecentActivity() {
    const recentActivity = await getRecentActivity();

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Admin Activity
                </CardTitle>
                <CardDescription>Latest actions by administrators</CardDescription>
            </CardHeader>
            <CardContent>
                {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                        {recentActivity.map((log) => (
                            <div key={log.id} className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={log.adminImage || undefined} />
                                    <AvatarFallback>
                                        {(log.adminFirstName?.[0] || log.adminEmail?.[0] || "A").toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm">
                                        <span className="font-medium">
                                            {log.adminFirstName || log.adminEmail?.split("@")[0] || "Admin"}
                                        </span>
                                        {" "}
                                        <span className="text-muted-foreground capitalize">
                                            {formatAction(log.action)}
                                        </span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {log.createdAt?.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/admin/activity">View All Activity</Link>
                        </Button>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No admin activity recorded yet
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
