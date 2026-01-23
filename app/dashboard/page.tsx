"use client";

import { useEffect, useState } from "react";
import { AppCard, AppData } from "@/components/platform/AppCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Loader2, User, CheckCircle, AlertCircle, Building2, Bell, Shield, Settings, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import type { TenantWithMembership } from "@/shared/schema";
import { safeUrl } from "@/lib/utils";

interface UserProfile {
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
    onboardingCompleted?: boolean;
    onboardingStep?: number;
    profileCompletionPercentage?: number;
    accountType?: string;
    userType?: string;
    dateOfBirth?: string;
}


const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
function isValidHexColor(color: string | null | undefined): boolean {
    if (!color || typeof color !== "string") return false;
    return HEX_COLOR_REGEX.test(color);
}


function CommunityOSMembershipList({ memberships }: { memberships: TenantWithMembership[] }) {
    if (memberships.length === 0) {
        return (
            <div className="text-center py-6 bg-background/50 rounded-lg border border-dashed border-primary/20">
                <p className="text-sm text-muted-foreground">
                    You are not currently a member of any organisations.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {memberships
                .filter(m => m.tenant.code && m.tenant.code.trim() !== "")
                .map((membership) => {
                    const sanitizedCode = encodeURIComponent(membership.tenant.code || '');
                    const logoUrl = safeUrl(membership.tenant.logoUrl);
                    const primaryColor = isValidHexColor(membership.tenant.primaryColor)
                        ? membership.tenant.primaryColor!
                        : '#6366f1';

                    return (
                        <div
                            key={membership.tenant.id}
                            className="p-4 bg-background/50 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                {logoUrl ? (
                                    <img
                                        src={logoUrl}
                                        alt={membership.tenant.name}
                                        className="h-8 w-8 rounded object-cover"
                                    />
                                ) : (
                                    <div
                                        className="h-8 w-8 rounded flex items-center justify-center text-white text-xs font-bold"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        {membership.tenant.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-semibold text-sm line-clamp-1">{membership.tenant.name}</h4>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                        {membership.role}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Button variant="default" size="sm" className="w-full justify-start gap-2 h-8" asChild>
                                    <Link href={`/communityos/${sanitizedCode}/dashboard`}>
                                        <Building2 className="h-3.5 w-3.5" />
                                        Visit Dashboard
                                    </Link>
                                </Button>
                                <Link
                                    href={`/org/${sanitizedCode}`}
                                    className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground hover:underline px-1"
                                >
                                    View Public Profile
                                    <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
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


export default function DashboardPage() {
    const [apps, setApps] = useState<AppData[]>([]);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [tenantMemberships, setTenantMemberships] = useState<TenantWithMembership[]>([]);
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
                } else {
                    // Log failure details for debugging
                    const errorText = await tenantsRes.text().catch(() => "Unable to read response");
                    console.error(
                        `[Dashboard] Failed to fetch tenants: status=${tenantsRes.status}, body=${errorText}`
                    );
                    // Set empty array as fallback to avoid silent failures
                    setTenantMemberships([]);
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

                            {/* CommunityOS Section */}
                            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-primary" />
                                        CommunityOS
                                    </CardTitle>
                                    <CardDescription>
                                        Explore and manage your organisation workspaces
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CommunityOSMembershipList memberships={tenantMemberships} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <span aria-hidden="true">⚡</span>
                                        Quick Actions
                                    </CardTitle>
                                    <CardDescription>
                                        Frequently used shortcuts
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {/* CommunityOS shortcut - shown first when user has tenant access */}
                                    {tenantMemberships.length > 0 && (() => {
                                        // Sanitize tenant code to prevent path traversal
                                        const sanitizedCode = encodeURIComponent(tenantMemberships[0].tenant.code || '');
                                        return (
                                            <Button variant="default" className="w-full justify-start gap-2" asChild>
                                                <Link href={`/communityos/${sanitizedCode}/dashboard`}>
                                                    <Building2 className="h-4 w-4" />
                                                    CommunityOS Dashboard
                                                </Link>
                                            </Button>
                                        );
                                    })()}
                                    <Button variant="outline" className="w-full justify-start gap-2" asChild>
                                        <Link href="/settings">
                                            <User className="h-4 w-4" />
                                            Profile
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start gap-2" asChild>
                                        <Link href="/settings#notifications">
                                            <Bell className="h-4 w-4" />
                                            Notifications
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start gap-2" asChild>
                                        <Link href="/settings#security">
                                            <Shield className="h-4 w-4" />
                                            Security
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start gap-2" asChild>
                                        <Link href="/settings#preferences">
                                            <Settings className="h-4 w-4" />
                                            Preferences
                                        </Link>
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
