"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Music,
    Users,
    CalendarDays,
    Heart,
    Building2,
    Briefcase,
    Loader2,
    CheckCircle,
    XCircle,
    FlaskConical,
    Info,
} from "lucide-react";
import { toast } from "sonner";
import {
    createTestGig,
    createTestMusician,
    createTestBand,
    createTestVolunteerOpportunity,
    createTestOrganisation,
    createTestVolunteer,
} from "./test-actions";

interface TestResult {
    success: boolean;
    message: string;
    id?: string;
}

interface TestItem {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    app: string;
    color: string;
    action: () => Promise<TestResult>;
}

const testItems: TestItem[] = [
    {
        id: "gig",
        name: "Test Gig",
        description: "Create a test gig event at a random venue",
        icon: CalendarDays,
        app: "Local Music Network",
        color: "purple",
        action: createTestGig,
    },
    {
        id: "musician",
        name: "Test Musician",
        description: "Create a test musician profile",
        icon: Music,
        app: "Local Music Network",
        color: "purple",
        action: createTestMusician,
    },
    {
        id: "band",
        name: "Test Band",
        description: "Create a test band with random name",
        icon: Users,
        app: "Local Music Network",
        color: "purple",
        action: createTestBand,
    },
    {
        id: "volunteer-opportunity",
        name: "Test Volunteer Opportunity",
        description: "Create a test volunteer role/opportunity",
        icon: Briefcase,
        app: "Volunteer Passport",
        color: "red",
        action: createTestVolunteerOpportunity,
    },
    {
        id: "organisation",
        name: "Test Organisation",
        description: "Create a test organisation for volunteering",
        icon: Building2,
        app: "Volunteer Passport",
        color: "red",
        action: createTestOrganisation,
    },
    {
        id: "volunteer",
        name: "Test Volunteer",
        description: "Create a test volunteer profile",
        icon: Heart,
        app: "Volunteer Passport",
        color: "red",
        action: createTestVolunteer,
    },
];

export default function TestAppsPage() {
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [results, setResults] = useState<Record<string, TestResult | undefined>>({});

    const handleTest = async (item: TestItem) => {
        setLoading((prev) => ({ ...prev, [item.id]: true }));
        setResults((prev) => ({ ...prev, [item.id]: undefined }));

        try {
            const result = await item.action();
            setResults((prev) => ({ ...prev, [item.id]: result }));

            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(`[Test Apps] Error creating ${item.name}:`, error);
            const result = { success: false, message: "An unexpected error occurred" };
            setResults((prev) => ({ ...prev, [item.id]: result }));
            toast.error(result.message);
        } finally {
            setLoading((prev) => ({ ...prev, [item.id]: false }));
        }
    };

    const groupedItems = testItems.reduce((acc, item) => {
        if (!acc[item.app]) acc[item.app] = [];
        acc[item.app].push(item);
        return acc;
    }, {} as Record<string, TestItem[]>);

    return (
        <div className="space-y-6 max-w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <FlaskConical className="h-8 w-8" />
                    Test Apps
                </h1>
                <p className="text-muted-foreground">Generate test data to verify app functionality</p>
            </div>

            {/* Info Card */}
            <Card className="border-blue-500/50 bg-blue-500/5">
                <CardContent className="flex items-start gap-4 py-4">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <p className="font-medium text-blue-700">Test Data Information</p>
                        <p className="text-sm text-blue-600">
                            All test data is prefixed with [TEST] for easy identification.
                            Test data can be cleaned up using the cleanup functionality in System → Maintenance.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Test Items by App */}
            {Object.entries(groupedItems).map(([app, items]) => (
                <Card key={app}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {app === "Local Music Network" ? (
                                <Music className="h-5 w-5 text-purple-500" />
                            ) : (
                                <Heart className="h-5 w-5 text-red-500" />
                            )}
                            {app}
                        </CardTitle>
                        <CardDescription>Test data generators for {app}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {items.map((item) => {
                                const Icon = item.icon;
                                const isLoading = loading[item.id];
                                const result = results[item.id];

                                return (
                                    <div
                                        key={item.id}
                                        className={`p-4 rounded-lg border bg-card transition-all ${result?.success
                                            ? "border-green-500/50"
                                            : result && !result.success
                                                ? "border-red-500/50"
                                                : ""
                                            }`}
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className={`p-2 rounded-lg ${item.color === "purple"
                                                ? "bg-purple-500/10"
                                                : "bg-red-500/10"
                                                }`}>
                                                <Icon className={`h-5 w-5 ${item.color === "purple"
                                                    ? "text-purple-500"
                                                    : "text-red-500"
                                                    }`} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>

                                        {result && (
                                            <div className={`mb-3 p-2 rounded text-sm ${result.success
                                                ? "bg-green-500/10 text-green-700"
                                                : "bg-red-500/10 text-red-700"
                                                }`}>
                                                <div className="flex items-center gap-2">
                                                    {result.success ? (
                                                        <CheckCircle className="h-4 w-4" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4" />
                                                    )}
                                                    <span className="truncate">{result.message}</span>
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            disabled={isLoading}
                                            onClick={() => handleTest(item)}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>Create {item.name}</>
                                            )}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Quick Stats */}
            <Card>
                <CardHeader>
                    <CardTitle>Testing Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">[TEST]</Badge>
                        <span className="text-sm text-muted-foreground">
                            All test data is prefixed with [TEST] for easy filtering
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">@smalltalk.test</Badge>
                        <span className="text-sm text-muted-foreground">
                            Test users use @smalltalk.test email domain
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">Logged</Badge>
                        <span className="text-sm text-muted-foreground">
                            All test data creation is logged in the admin activity log
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
