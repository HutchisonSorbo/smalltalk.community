"use client";

import { useEffect, useState } from "react";
import { AppCard, AppData } from "@/components/platform/AppCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, User, CheckCircle, AlertCircle, Building2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
    onboardingCompleted?: boolean;
    onboardingStep?: number;
    profileCompletionPercentage?: number;
    accountType?: string;
    dateOfBirth?: string;
}

interface TenantMembership {
    tenant: {
        id: string;
        code: string;
        name: string;
        logoUrl: string | null;
        primaryColor: string | null;
        description: string | null;
    };
    role: "admin" | "board" | "member";
    joinedAt: string;
}

function calculateProfileCompletion(user: UserProfile | null): { percentage: number; missing: string[] } {
    if (!user) return { percentage: 0, missing: ["Sign in to view your profile"] };

    const checks = [
        { field: "firstName", label: "First name", value: !!user.firstName },
        { field: "lastName", label: "Last name", value: !!user.lastName },
        { field: "email", label: "Email", value: !!user.email },
        { field: "profileImageUrl", label: "Profile photo", value: !!user.profileImageUrl },
        { field: "dateOfBirth", label: "Date of birth", value: !!user.dateOfBirth },
        { field: "onboardingCompleted", label: "Onboarding", value: !!user.onboardingCompleted },
    ];

    const completed = checks.filter(c => c.value).length;
    const missing = checks.filter(c => !c.value).map(c => c.label);
    const percentage = Math.round((completed / checks.length) * 100);

    return { percentage, missing };
}

function getRoleBadgeVariant(role: string): "default" | "secondary" | "outline" {
    switch (role) {
        case "admin": return "default";
        case "board": return "secondary";
        default: return "outline";
    }
}

export default function DashboardPage() {
    const [apps, setApps] = useState<AppData[]>([]);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [tenantMemberships, setTenantMemberships] = useState<TenantMembership[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch user apps
                const appsRes = await fetch("/api/user/apps");
                const appsData = await appsRes.json();
                if (Array.isArray(appsData)) {
                    setApps(appsData);
                }

                // Fetch user profile
                const userRes = await fetch("/api/user/profile");
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData.user || userData);
                }

                // Fetch CommunityOS tenant memberships
                const tenantsRes = await fetch("/api/user/tenants");
                if (tenantsRes.ok) {
                    const tenantsData = await tenantsRes.json();
                    if (Array.isArray(tenantsData.tenants)) {
                        setTenantMemberships(tenantsData.tenants);
                    }
                }
            } catch (error) {
                console.error(error);
                toast({
                    title: "Error",
                    description: "Failed to load dashboard data.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [toast]);

    const handleRemoveApp = async (appId: string) => {
        try {
            const res = await fetch("/api/user/apps", {
                method: "DELETE",
                body: JSON.stringify({ appId })
            });
            if (res.ok) {
                setApps(prev => prev.filter(a => a.id !== appId));
                toast({
                    title: "App removed",
                    description: "Application removed from your dashboard."
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to remove app.",
                variant: "destructive"
            });
        }
    };

    const { percentage, missing } = calculateProfileCompletion(user);

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {user?.firstName ? `Welcome back, ${user.firstName}` : "Your Dashboard"}
                        </h1>
                        <p className="text-muted-foreground">Manage your apps and profile</p>
                    </div>
                    <Link href="/apps">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Apps
                        </Button>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content - Apps */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Apps</CardTitle>
                                    <CardDescription>Quick access to your installed applications</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {apps.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {apps.map(app => (
                                                <AppCard
                                                    key={app.id}
                                                    app={app}
                                                    variant="dashboard"
                                                    onRemove={() => handleRemoveApp(app.id)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 border-2 border-dashed rounded-xl">
                                            <h3 className="text-lg font-semibold mb-2">No apps installed</h3>
                                            <p className="text-muted-foreground mb-4">Start by adding apps to your dashboard.</p>
                                            <Link href="/apps">
                                                <Button variant="secondary">Browse App Catalogue</Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar - Profile Completion */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Profile Completion
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Progress</span>
                                            <span className="font-medium">{percentage}%</span>
                                        </div>
                                        <Progress value={percentage} className="h-2" />
                                    </div>

                                    {percentage < 100 ? (
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">Complete your profile:</p>
                                            <ul className="space-y-1">
                                                {missing.slice(0, 3).map((item, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm">
                                                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                            <Button variant="outline" className="w-full mt-4" asChild>
                                                <Link href="/settings">Complete Profile</Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm text-green-600">
                                            <CheckCircle className="h-4 w-4" />
                                            Profile complete!
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* CommunityOS Workspaces - shown if user has tenant memberships */}
                            {tenantMemberships.length > 0 && (
                                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5 text-primary" />
                                            CommunityOS
                                        </CardTitle>
                                        <CardDescription>
                                            Access your organisation workspaces
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {tenantMemberships.map((membership) => (
                                            <Link
                                                key={membership.tenant.id}
                                                href={`/communityos/${membership.tenant.code}/dashboard`}
                                                className="block"
                                            >
                                                <div
                                                    className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-accent transition-colors group"
                                                    style={{
                                                        borderColor: membership.tenant.primaryColor || undefined,
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        {membership.tenant.logoUrl ? (
                                                            <img
                                                                src={membership.tenant.logoUrl}
                                                                alt={membership.tenant.name}
                                                                className="h-8 w-8 rounded object-cover"
                                                            />
                                                        ) : (
                                                            <div
                                                                className="h-8 w-8 rounded flex items-center justify-center text-white font-bold text-sm"
                                                                style={{
                                                                    backgroundColor: membership.tenant.primaryColor || "#6366f1"
                                                                }}
                                                            >
                                                                {membership.tenant.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-sm truncate">
                                                                {membership.tenant.name}
                                                            </p>
                                                            <Badge
                                                                variant={getRoleBadgeVariant(membership.role)}
                                                                className="mt-1 capitalize text-xs"
                                                            >
                                                                {membership.role}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                                                </div>
                                            </Link>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <Link href="/local-music-network">Local Music Network</Link>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <Link href="/volunteer-passport">Volunteer Passport</Link>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <Link href="/settings">Account Settings</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
