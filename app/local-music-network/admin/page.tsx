import { db } from "@/server/db";
import {
    users,
    musicianProfiles,
    bands,
    gigs,
    classifieds
} from "@shared/schema";
import { count, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Music2, Mic2, Ticket, Search } from "lucide-react";

async function getStats() {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [musicianCount] = await db.select({ count: count() }).from(musicianProfiles);
    const [bandCount] = await db.select({ count: count() }).from(bands);
    const [gigCount] = await db.select({ count: count() }).from(gigs);
    const [auditionCount] = await db.select({ count: count() }).from(classifieds);

    return {
        users: userCount?.count ?? 0,
        musicians: musicianCount?.count ?? 0,
        bands: bandCount?.count ?? 0,
        gigs: gigCount?.count ?? 0,
        auditions: auditionCount?.count ?? 0,
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Musicians</CardTitle>
                        <Music2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.musicians}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bands</CardTitle>
                        <Mic2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.bands}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Gigs</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.gigs}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Auditions</CardTitle>
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.auditions}</div>
                    </CardContent>
                </Card>
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4">
                <h2 className="text-xl font-bold mb-4">Welcome to the Admin Panel</h2>
                <p className="text-muted-foreground">Select a category from the sidebar to manage content.</p>
            </div>
        </div>
    );
}

// CodeRabbit Audit Trigger
