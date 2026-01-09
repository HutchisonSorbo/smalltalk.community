import { db } from "@/server/db";
import * as Sentry from "@sentry/nextjs";

import {
    users,
    musicianProfiles,
    bands,
    gigs,
    classifieds,
    professionalProfiles,
    marketplaceListings,
    volunteerProfiles,
    organisations,
    volunteerRoles,
    announcements,
} from "@shared/schema";
import { count, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Music,
    Users,
    CalendarDays,
    FileText,
    Briefcase,
    ShoppingBag,
    Heart,
    Building2,
    Megaphone,
    Database,
} from "lucide-react";

/**
 * Helper to safely execute a count query and return a default value on failure.
 * @param query A promise representing the database count query
 * @returns A promise resolving to the query result or a default [{count: 0}]
 */
async function safeQueryCount<T extends { count: number }>(
    query: Promise<T[]>
): Promise<T[]> {
    try {
        return await query;
    } catch {
        return [{ count: 0 } as T];
    }
}

/**
 * Fetches platform-wide content statistics for the admin dashboard.
 * 
 * This function retrieves counts for various content types (musicians, bands, gigs, etc.)
 * using optimized queries. It handles database failures gracefully by returning
 * zeroed-out stats instead of throwing.
 * 
 * @returns {Promise<{
 *   musicians: number;
 *   bands: number;
 *   gigs: number;
 *   classifieds: number;
 *   professionals: number;
 *   listings: number;
 *   volunteers: number;
 *   organisations: number;
 *   volunteerRoles: number;
 *   announcements: number;
 *   activeAnnouncements: number;
 * }>} An object containing counts for all major platform content types.
 * @throws {never} This function catches all internal database errors and tracks them via Sentry.
 */
async function getContentStats() {
    const defaultStats = {
        musicians: 0,
        bands: 0,
        gigs: 0,
        classifieds: 0,
        professionals: 0,
        listings: 0,
        volunteers: 0,
        organisations: 0,
        volunteerRoles: 0,
        announcements: 0,
        activeAnnouncements: 0,
    };

    try {
        const [
            musiciansCount,
            bandsCount,
            gigsCount,
            classifiedsCount,
            professionalsCount,
            listingsCount,
            volunteersCount,
            orgsCount,
            volunteerRolesCount,
            announcementsCount,
            activeAnnouncementsCount,
        ] = await Promise.all([
            safeQueryCount(db.select({ count: count() }).from(musicianProfiles)),
            safeQueryCount(db.select({ count: count() }).from(bands)),
            safeQueryCount(db.select({ count: count() }).from(gigs)),
            safeQueryCount(db.select({ count: count() }).from(classifieds)),
            safeQueryCount(db.select({ count: count() }).from(professionalProfiles)),
            safeQueryCount(db.select({ count: count() }).from(marketplaceListings)),
            safeQueryCount(db.select({ count: count() }).from(volunteerProfiles)),
            safeQueryCount(db.select({ count: count() }).from(organisations)),
            safeQueryCount(db.select({ count: count() }).from(volunteerRoles)),
            safeQueryCount(db.select({ count: count() }).from(announcements)),
            safeQueryCount(db.select({ count: count() }).from(announcements).where(eq(announcements.isActive, true))),
        ]);

        return {
            musicians: musiciansCount[0]?.count ?? 0,
            bands: bandsCount[0]?.count ?? 0,
            gigs: gigsCount[0]?.count ?? 0,
            classifieds: classifiedsCount[0]?.count ?? 0,
            professionals: professionalsCount[0]?.count ?? 0,
            listings: listingsCount[0]?.count ?? 0,
            volunteers: volunteersCount[0]?.count ?? 0,
            organisations: orgsCount[0]?.count ?? 0,
            volunteerRoles: volunteerRolesCount[0]?.count ?? 0,
            announcements: announcementsCount[0]?.count ?? 0,
            activeAnnouncements: activeAnnouncementsCount[0]?.count ?? 0,
        };
    } catch (error) {
        console.error("[Admin Content] Error fetching content stats:", error);
        Sentry.captureException(error);
        return defaultStats;
    }
}



interface ContentCard {
    title: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    app?: string;
    href?: string;
}

export default async function ContentOverviewPage() {
    const stats = await getContentStats();

    const localMusicNetworkContent: ContentCard[] = [
        {
            title: "Musician Profiles",
            count: stats.musicians,
            icon: Music,
            description: "Individual musician profiles",
            app: "Local Music Network",
        },
        {
            title: "Bands",
            count: stats.bands,
            icon: Users,
            description: "Band profiles and groups",
            app: "Local Music Network",
        },
        {
            title: "Gigs",
            count: stats.gigs,
            icon: CalendarDays,
            description: "Events and performances",
            app: "Local Music Network",
        },
        {
            title: "Classifieds",
            count: stats.classifieds,
            icon: FileText,
            description: "Digital auditions & wanted ads",
            app: "Local Music Network",
        },
        {
            title: "Professionals",
            count: stats.professionals,
            icon: Briefcase,
            description: "Industry professional profiles",
            app: "Local Music Network",
        },
        {
            title: "Marketplace Listings",
            count: stats.listings,
            icon: ShoppingBag,
            description: "For sale listings",
            app: "Local Music Network",
        },
    ];

    const volunteerPassportContent: ContentCard[] = [
        {
            title: "Volunteer Profiles",
            count: stats.volunteers,
            icon: Heart,
            description: "Volunteer user profiles",
            app: "Volunteer Passport",
        },
        {
            title: "Organisations",
            count: stats.organisations,
            icon: Building2,
            description: "Registered organisations",
            app: "Volunteer Passport",
            href: "/admin/organisations",
        },
        {
            title: "Volunteer Roles",
            count: stats.volunteerRoles,
            icon: Briefcase,
            description: "Available opportunities",
            app: "Volunteer Passport",
        },
    ];

    const platformContent: ContentCard[] = [
        {
            title: "Announcements",
            count: stats.announcements,
            icon: Megaphone,
            description: `${stats.activeAnnouncements} active`,
            href: "/admin/announcements",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Content Overview</h1>
                <p className="text-muted-foreground">Platform content across all applications</p>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Content Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Object.values(stats).reduce((a, b) => a + b, 0) - stats.activeAnnouncements}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Music Network</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {stats.musicians + stats.bands + stats.gigs + stats.classifieds + stats.professionals + stats.listings}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Volunteer Passport</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {stats.volunteers + stats.organisations + stats.volunteerRoles}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active Announcements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {stats.activeAnnouncements}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Local Music Network */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Music className="h-5 w-5 text-purple-500" />
                        Local Music Network
                    </CardTitle>
                    <CardDescription>Content from the music community app</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {localMusicNetworkContent.map((item) => (
                            <div
                                key={item.title}
                                className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                            >
                                <div className="p-2 rounded-lg bg-purple-500/10">
                                    <item.icon className="h-5 w-5 text-purple-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{item.title}</p>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                                <div className="text-2xl font-bold">{item.count}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Volunteer Passport */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        Volunteer Passport
                    </CardTitle>
                    <CardDescription>Content from the volunteering app</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        {volunteerPassportContent.map((item) => (
                            <div
                                key={item.title}
                                className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                            >
                                <div className="p-2 rounded-lg bg-red-500/10">
                                    <item.icon className="h-5 w-5 text-red-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{item.title}</p>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold">{item.count}</span>
                                    {item.href && (
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={item.href}>View</Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Platform Content */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Platform Content
                    </CardTitle>
                    <CardDescription>Site-wide content management</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        {platformContent.map((item) => (
                            <div
                                key={item.title}
                                className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                            >
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <item.icon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{item.title}</p>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold">{item.count}</span>
                                    {item.href && (
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={item.href}>Manage</Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
