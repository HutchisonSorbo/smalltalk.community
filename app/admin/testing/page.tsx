"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FlaskConical,
    User,
    Building2,
    Briefcase,
    Music,
    Trash2,
    CheckCircle2,
    AlertCircle,
    RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TestStats {
    individuals: number;
    organisations: number;
    opportunities: number;
    musicians: number;
    professionals: number;
    gigs: number;
    bands: number;
}

export default function AdminTestingPage() {
    const [stats, setStats] = useState<TestStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [cleaning, setCleaning] = useState(false);
    const { toast } = useToast();

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch("/admin/api/testing/stats");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to fetch test data stats",
                    variant: "destructive"
                });
            }
        } catch {
            toast({
                title: "Error",
                description: "Failed to connect to API",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const cleanupAll = async () => {
        if (!confirm("Are you sure you want to delete ALL test data? This cannot be undone.")) {
            return;
        }

        setCleaning(true);
        try {
            const res = await fetch("/admin/api/testing/cleanup", { method: "DELETE" });
            if (res.ok) {
                const data = await res.json();
                toast({
                    title: "Cleanup Complete",
                    description: `Deleted ${data.deleted} test entities`,
                });
                fetchStats();
            } else {
                toast({
                    title: "Error",
                    description: "Failed to cleanup test data",
                    variant: "destructive"
                });
            }
        } catch {
            toast({
                title: "Error",
                description: "Failed to connect to API",
                variant: "destructive"
            });
        } finally {
            setCleaning(false);
        }
    };

    const testCategories = [
        {
            title: "Test Individuals",
            description: "Create test user accounts with various age groups and profiles",
            icon: User,
            href: "/admin/testing/individuals",
            color: "bg-blue-500"
        },
        {
            title: "Test Organisations",
            description: "Create test business/council/charity accounts",
            icon: Building2,
            href: "/admin/testing/organisations",
            color: "bg-green-500"
        },
        {
            title: "Test Opportunities",
            description: "Create test work experience, volunteer, and apprenticeship listings",
            icon: Briefcase,
            href: "/admin/testing/opportunities",
            color: "bg-orange-500"
        },
        {
            title: "Test Music Entities",
            description: "Create test musicians, bands, professionals, and gigs",
            icon: Music,
            href: "/admin/testing/music",
            color: "bg-purple-500"
        }
    ];

    const totalTestData = stats
        ? stats.individuals + stats.organisations + stats.opportunities +
        stats.musicians + stats.professionals + stats.gigs + stats.bands
        : 0;

    return (
        <div className="flex-1 space-y-6 pt-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FlaskConical className="h-8 w-8 text-primary" />
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Test Section</h2>
                        <p className="text-muted-foreground">
                            Create and manage test data for end-to-end testing
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={fetchStats}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Stats
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={cleanupAll}
                        disabled={cleaning || totalTestData === 0}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {cleaning ? "Cleaning..." : "Cleanup All"}
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        Test Data Overview
                        {stats && totalTestData > 0 && (
                            <Badge variant="secondary">{totalTestData} entities</Badge>
                        )}
                    </CardTitle>
                    <CardDescription>
                        All test entities are marked with <code className="text-xs bg-muted px-1 py-0.5 rounded">isTestData: true</code> and
                        are excluded from public listings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {stats ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            <StatItem label="Individuals" value={stats.individuals} />
                            <StatItem label="Organisations" value={stats.organisations} />
                            <StatItem label="Opportunities" value={stats.opportunities} />
                            <StatItem label="Musicians" value={stats.musicians} />
                            <StatItem label="Professionals" value={stats.professionals} />
                            <StatItem label="Bands" value={stats.bands} />
                            <StatItem label="Gigs" value={stats.gigs} />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            Click "Refresh Stats" to load test data counts
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Test Categories */}
            <div className="grid gap-4 md:grid-cols-2">
                {testCategories.map((category) => (
                    <Link key={category.title} href={category.href}>
                        <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className={`${category.color} p-3 rounded-lg text-white`}>
                                    <category.icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{category.title}</CardTitle>
                                    <CardDescription>{category.description}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Best Practices */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Testing Best Practices
                    </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                    <ul className="grid gap-2 list-none pl-0">
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">✓</span>
                            <span>Test data is <strong>isolated</strong> from production using the <code>isTestData</code> flag</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">✓</span>
                            <span>All test entities use the domain <code>@smalltalk.test</code> for emails</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">✓</span>
                            <span>Test locations are within <strong>Mitchell Shire</strong> and <strong>Murrindindi Shire</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">✓</span>
                            <span>Cleanup is <strong>idempotent</strong> - run it multiple times safely</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">✓</span>
                            <span>All test data creation/deletion is logged in <strong>audit trail</strong></span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}

function StatItem({ label, value }: { label: string; value: number }) {
    return (
        <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
        </div>
    );
}
