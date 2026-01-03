
import { db } from "@/server/db";
import { users } from "@shared/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

async function getRecentUsers() {
    try {
        const recentUsers = await db
            .select()
            .from(users)
            .orderBy(desc(users.createdAt))
            .limit(5);
        return recentUsers;
    } catch (error) {
        console.error("[Admin Dashboard] Error fetching recent users:", error);
        return [];
    }
}

export async function RecentUsers() {
    const recentUsers = await getRecentUsers();

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    New Users
                </CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
            </CardHeader>
            <CardContent>
                {recentUsers.length > 0 ? (
                    <div className="space-y-4">
                        {recentUsers.map((user) => (
                            <div key={user.id} className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.profileImageUrl || undefined} />
                                    <AvatarFallback>
                                        {(user.firstName?.[0] || user.email?.[0] || "U").toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {user.firstName || user.email?.split('@')[0] || "User"} {user.lastName || ""}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {user.email}
                                    </p>
                                </div>
                                <Badge variant={user.onboardingCompleted ? 'default' : 'secondary'} className="text-xs">
                                    {user.onboardingCompleted ? 'Active' : 'Pending'}
                                </Badge>
                            </div>
                        ))}
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/admin/users">View All Users</Link>
                        </Button>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No recent users
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
