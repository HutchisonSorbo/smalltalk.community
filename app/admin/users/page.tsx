import { db } from "@/server/db";
import { users, musicianProfiles, volunteerProfiles, professionalProfiles, sysUserRoles, sysRoles } from "@shared/schema";
import { desc, like, or, eq, and, gte, lte, sql, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Users, Search, Filter, ChevronLeft, ChevronRight, Eye, Music, Heart, Briefcase } from "lucide-react";

interface SearchParams {
    page?: string;
    search?: string;
    accountType?: string;
    status?: string;
    onboarding?: string;
}

async function getUsers(searchParams: SearchParams) {
    try {
        const page = parseInt(searchParams.page || "1", 10);
        const pageSize = 25;
        const offset = (page - 1) * pageSize;
        const search = searchParams.search?.trim();
        const accountType = searchParams.accountType;
        const onboarding = searchParams.onboarding;

        // Build conditions
        const conditions = [];

        if (search) {
            conditions.push(
                or(
                    like(users.email, `%${search}%`),
                    like(users.firstName, `%${search}%`),
                    like(users.lastName, `%${search}%`)
                )
            );
        }

        if (accountType && accountType !== "all") {
            conditions.push(eq(users.accountType, accountType));
        }

        if (onboarding === "completed") {
            conditions.push(eq(users.onboardingCompleted, true));
        } else if (onboarding === "incomplete") {
            conditions.push(eq(users.onboardingCompleted, false));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [allUsers, totalCount] = await Promise.all([
            db
                .select()
                .from(users)
                .where(whereClause)
                .orderBy(desc(users.createdAt))
                .limit(pageSize)
                .offset(offset),
            db
                .select({ count: count() })
                .from(users)
                .where(whereClause),
        ]);

        return {
            users: allUsers,
            total: totalCount[0]?.count ?? 0,
            page,
            pageSize,
            totalPages: Math.ceil((totalCount[0]?.count ?? 0) / pageSize),
            error: null,
        };
    } catch (error) {
        console.error("[Admin Users] Error fetching users:", error);
        return {
            users: [],
            total: 0,
            page: 1,
            pageSize: 25,
            totalPages: 0,
            error: error instanceof Error ? error.message : "Failed to load users",
        };
    }
}

async function getUserStats() {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [totalUsers, adminCount, newUsers, completedOnboarding] = await Promise.all([
            db.select({ count: count() }).from(users),
            db.select({ count: count() }).from(users).where(eq(users.isAdmin, true)),
            db.select({ count: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo)),
            db.select({ count: count() }).from(users).where(eq(users.onboardingCompleted, true)),
        ]);

        return {
            total: totalUsers[0]?.count ?? 0,
            admins: adminCount[0]?.count ?? 0,
            newThisMonth: newUsers[0]?.count ?? 0,
            completedOnboarding: completedOnboarding[0]?.count ?? 0,
        };
    } catch (error) {
        console.error("[Admin Users] Error fetching user stats:", error);
        return {
            total: 0,
            admins: 0,
            newThisMonth: 0,
            completedOnboarding: 0,
        };
    }
}

async function getUserProfiles(userIds: string[]) {
    if (userIds.length === 0) return { musicians: [], volunteers: [], professionals: [] };

    try {
        const [musicians, volunteers, professionals] = await Promise.all([
            db.select({ userId: musicianProfiles.userId }).from(musicianProfiles).where(sql`${musicianProfiles.userId} = ANY(${userIds})`),
            db.select({ userId: volunteerProfiles.userId }).from(volunteerProfiles).where(sql`${volunteerProfiles.userId} = ANY(${userIds})`),
            db.select({ userId: professionalProfiles.userId }).from(professionalProfiles).where(sql`${professionalProfiles.userId} = ANY(${userIds})`),
        ]);

        return {
            musicians: musicians.map(m => m.userId),
            volunteers: volunteers.map(v => v.userId),
            professionals: professionals.map(p => p.userId),
        };
    } catch (error) {
        console.error("[Admin Users] Error fetching user profiles:", error);
        return { musicians: [], volunteers: [], professionals: [] };
    }
}

export default async function UsersAdminPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const { users: allUsers, total, page, pageSize, totalPages, error } = await getUsers(params);
    const stats = await getUserStats();
    const userIds = allUsers.map(u => u.id);
    const profiles = await getUserProfiles(userIds);

    const accountTypes = ["Individual", "Business", "Government Organisation", "Charity", "Other"];

    return (
        <div className="space-y-6">
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

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">View and manage platform users</p>
                </div>
            </div>


            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.admins}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">+{stats.newThisMonth}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Onboarding Complete</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.total > 0 ? Math.round((stats.completedOnboarding / stats.total) * 100) : 0}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <form className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    name="search"
                                    placeholder="Search by name or email..."
                                    defaultValue={params.search}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select name="accountType" defaultValue={params.accountType || "all"}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Account Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {accountTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select name="onboarding" defaultValue={params.onboarding || "all"}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Onboarding" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="incomplete">Incomplete</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit">
                            <Filter className="h-4 w-4 mr-2" />
                            Apply Filters
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                        Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total.toLocaleString()} users
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Account Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Profiles</TableHead>
                                <TableHead>Onboarding</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.profileImageUrl || undefined} />
                                                <AvatarFallback>
                                                    {(user.firstName?.[0] || user.email?.[0] || "?").toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{user.accountType || "Individual"}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1 flex-wrap">
                                            {user.isAdmin && (
                                                <Badge variant="default">Admin</Badge>
                                            )}
                                            {user.isMinor && (
                                                <Badge variant="secondary">Minor</Badge>
                                            )}
                                            {!user.isAdmin && !user.isMinor && (
                                                <span className="text-muted-foreground text-sm">—</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {profiles.musicians.includes(user.id) && (
                                                <Badge variant="outline" className="gap-1">
                                                    <Music className="h-3 w-3" />
                                                    <span className="sr-only sm:not-sr-only">Musician</span>
                                                </Badge>
                                            )}
                                            {profiles.volunteers.includes(user.id) && (
                                                <Badge variant="outline" className="gap-1">
                                                    <Heart className="h-3 w-3" />
                                                    <span className="sr-only sm:not-sr-only">Volunteer</span>
                                                </Badge>
                                            )}
                                            {profiles.professionals.includes(user.id) && (
                                                <Badge variant="outline" className="gap-1">
                                                    <Briefcase className="h-3 w-3" />
                                                    <span className="sr-only sm:not-sr-only">Pro</span>
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.onboardingCompleted ? (
                                            <Badge variant="default" className="bg-green-500">Complete</Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                Step {user.onboardingStep || 0}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {user.createdAt?.toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/admin/users/${user.id}`}>
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    disabled={page <= 1}
                                >
                                    <Link
                                        href={{
                                            pathname: "/admin/users",
                                            query: { ...params, page: page - 1 },
                                        }}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    disabled={page >= totalPages}
                                >
                                    <Link
                                        href={{
                                            pathname: "/admin/users",
                                            query: { ...params, page: page + 1 },
                                        }}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
