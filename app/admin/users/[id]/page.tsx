import { db } from "@/server/db";
import { users, musicianProfiles, volunteerProfiles, professionalProfiles, bands, bandMembers, sysUserRoles, sysRoles, userApps, apps } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
    ArrowLeft, Mail, Calendar, MapPin, Shield, Music, Heart, Briefcase, Users, AppWindow,
    UserCog, Clock, CheckCircle, XCircle, Edit
} from "lucide-react";
import { UserActionsClient } from "./user-actions-client";

async function getUser(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return user;
}

async function getUserProfiles(userId: string) {
    const [musicianProfile, volunteerProfile, professionalProfile] = await Promise.all([
        db.select().from(musicianProfiles).where(eq(musicianProfiles.userId, userId)).limit(1),
        db.select().from(volunteerProfiles).where(eq(volunteerProfiles.userId, userId)).limit(1),
        db.select().from(professionalProfiles).where(eq(professionalProfiles.userId, userId)).limit(1),
    ]);

    return {
        musician: musicianProfile[0],
        volunteer: volunteerProfile[0],
        professional: professionalProfile[0],
    };
}

async function getUserBands(userId: string) {
    const userBands = await db
        .select({
            bandId: bandMembers.bandId,
            role: bandMembers.role,
            bandName: bands.name,
        })
        .from(bandMembers)
        .innerJoin(bands, eq(bandMembers.bandId, bands.id))
        .where(eq(bandMembers.userId, userId));

    return userBands;
}

async function getUserRoles(userId: string) {
    const roles = await db
        .select({
            roleId: sysUserRoles.roleId,
            roleName: sysRoles.name,
            roleDescription: sysRoles.description,
        })
        .from(sysUserRoles)
        .innerJoin(sysRoles, eq(sysUserRoles.roleId, sysRoles.id))
        .where(eq(sysUserRoles.userId, userId));

    return roles;
}

async function getUserApps(userId: string) {
    const userAppsList = await db
        .select({
            appId: userApps.appId,
            appName: apps.name,
            appIcon: apps.iconUrl,
            isPinned: userApps.isPinned,
        })
        .from(userApps)
        .innerJoin(apps, eq(userApps.appId, apps.id))
        .where(eq(userApps.userId, userId));

    return userAppsList;
}

export default async function UserDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const user = await getUser(id);

    if (!user) {
        notFound();
    }

    const profiles = await getUserProfiles(id);
    const userBands = await getUserBands(id);
    const userRoles = await getUserRoles(id);
    const userAppsList = await getUserApps(id);

    const age = user.dateOfBirth
        ? Math.floor((Date.now() - user.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/admin/users">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Users
                        </Link>
                    </Button>
                </div>
            </div>

            {/* User Profile Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={user.profileImageUrl || undefined} />
                            <AvatarFallback className="text-2xl">
                                {(user.firstName?.[0] || user.email?.[0] || "?").toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-4">
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-2xl font-bold">
                                        {user.firstName} {user.lastName}
                                    </h1>
                                    {user.isAdmin && (
                                        <Badge variant="default">
                                            <Shield className="h-3 w-3 mr-1" />
                                            Admin
                                        </Badge>
                                    )}
                                    {user.isMinor && (
                                        <Badge variant="secondary">Minor</Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                    <Mail className="h-4 w-4" />
                                    <span>{user.email}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{user.accountType || "Individual"}</Badge>
                                </div>
                                {age && (
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        {age} years old
                                    </div>
                                )}
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    Joined {user.createdAt?.toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {user.onboardingCompleted ? (
                                    <Badge className="bg-green-500">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Onboarding Complete
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Onboarding Step {user.onboardingStep || 0}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <UserActionsClient user={user} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Profiles Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Connected Profiles
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {profiles.musician && (
                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                <Music className="h-5 w-5 text-purple-500 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-medium">{profiles.musician.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Musician Profile • {profiles.musician.instruments?.join(", ") || "No instruments"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {profiles.musician.location}
                                    </p>
                                </div>
                            </div>
                        )}
                        {profiles.volunteer && (
                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                <Heart className="h-5 w-5 text-red-500 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-medium">{profiles.volunteer.headline || "Volunteer"}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Volunteer Profile
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {profiles.volunteer.locationSuburb}
                                    </p>
                                </div>
                            </div>
                        )}
                        {profiles.professional && (
                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                <Briefcase className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-medium">{profiles.professional.businessName || profiles.professional.role}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {profiles.professional.role} • Professional Profile
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {profiles.professional.location}
                                    </p>
                                </div>
                            </div>
                        )}
                        {userBands.length > 0 && (
                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                <Users className="h-5 w-5 text-green-500 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-medium">Band Memberships</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {userBands.map((band: any) => (
                                            <Badge key={band.bandId} variant="outline">
                                                {band.bandName} ({band.role})
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {!profiles.musician && !profiles.volunteer && !profiles.professional && userBands.length === 0 && (
                            <p className="text-muted-foreground text-center py-4">No connected profiles</p>
                        )}
                    </CardContent>
                </Card>

                {/* Roles & Apps Section */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCog className="h-5 w-5" />
                                System Roles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {userRoles.length > 0 ? (
                                <div className="space-y-2">
                                    {userRoles.map((role: any) => (
                                        <div key={role.roleId} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                            <div>
                                                <p className="font-medium capitalize">{role.roleName?.replace(/_/g, " ")}</p>
                                                {role.roleDescription && (
                                                    <p className="text-xs text-muted-foreground">{role.roleDescription}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">No system roles assigned</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AppWindow className="h-5 w-5" />
                                Installed Apps
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {userAppsList.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {userAppsList.map((app: any) => (
                                        <Badge key={app.appId} variant="outline" className="gap-2 py-1.5">
                                            {app.appIcon && (
                                                <img src={app.appIcon} alt="" className="h-4 w-4 rounded" />
                                            )}
                                            {app.appName}
                                            {app.isPinned && <span className="text-yellow-500">★</span>}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">No apps installed</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Additional Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">User ID</p>
                            <p className="font-mono text-sm">{user.id}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">User Type</p>
                            <p>{user.userType || "individual"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Message Privacy</p>
                            <p className="capitalize">{user.messagePrivacy?.replace(/_/g, " ") || "Everyone"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Last Active</p>
                            <p>{user.lastActiveAt?.toLocaleString() || "Never"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Profile Completion</p>
                            <p>{user.profileCompletionPercentage || 0}%</p>
                        </div>
                        {user.organisationName && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Organisation</p>
                                <p>{user.organisationName}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
