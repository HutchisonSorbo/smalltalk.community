import { db } from "@/server/db";
import { users, userOnboardingResponses } from "@shared/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

async function getOnboardingData() {
    // Get onboarding responses with user info
    const responses = await db
        .select({
            id: userOnboardingResponses.id,
            userId: userOnboardingResponses.userId,
            questionKey: userOnboardingResponses.questionKey,
            response: userOnboardingResponses.response,
            createdAt: userOnboardingResponses.createdAt,
            userEmail: users.email,
            userFirstName: users.firstName,
            userLastName: users.lastName,
            accountType: users.accountType,
        })
        .from(userOnboardingResponses)
        .leftJoin(users, eq(userOnboardingResponses.userId, users.id))
        .orderBy(desc(userOnboardingResponses.createdAt))
        .limit(100);

    return responses;
}

async function getOnboardingStats() {
    // Get unique question keys and counts
    const allResponses = await db
        .select({
            questionKey: userOnboardingResponses.questionKey,
        })
        .from(userOnboardingResponses);

    const questionCounts: Record<string, number> = {};
    allResponses.forEach(r => {
        questionCounts[r.questionKey] = (questionCounts[r.questionKey] || 0) + 1;
    });

    return {
        totalResponses: allResponses.length,
        questionBreakdown: questionCounts,
    };
}

export default async function OnboardingAdminPage() {
    const [responses, stats] = await Promise.all([
        getOnboardingData(),
        getOnboardingStats(),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Onboarding Data</h1>
                    <p className="text-muted-foreground">View and export user onboarding responses</p>
                </div>
                <Button asChild>
                    <Link href="/api/admin/onboarding/export">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Link>
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalResponses}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Unique Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Object.keys(stats.questionBreakdown).length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg Responses/Question</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Object.keys(stats.questionBreakdown).length > 0
                                ? Math.round(stats.totalResponses / Object.keys(stats.questionBreakdown).length)
                                : 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Question Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Responses by Question</CardTitle>
                    <CardDescription>Number of responses per onboarding question</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(stats.questionBreakdown).map(([key, count]) => (
                            <div key={key} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md text-sm">
                                <span className="font-medium">{key}:</span>
                                <span className="text-muted-foreground">{count}</span>
                            </div>
                        ))}
                        {Object.keys(stats.questionBreakdown).length === 0 && (
                            <p className="text-muted-foreground">No responses yet</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Responses Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Responses</CardTitle>
                    <CardDescription>Last 100 onboarding responses</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Account Type</TableHead>
                                <TableHead>Question</TableHead>
                                <TableHead>Response</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {responses.length > 0 ? responses.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>
                                        <div className="font-medium">
                                            {row.userFirstName} {row.userLastName}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {row.userEmail}
                                        </div>
                                    </TableCell>
                                    <TableCell>{row.accountType}</TableCell>
                                    <TableCell className="font-mono text-xs">{row.questionKey}</TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {JSON.stringify(row.response)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {row.createdAt?.toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        No onboarding responses found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
