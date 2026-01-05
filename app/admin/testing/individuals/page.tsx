"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, User, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mitchell & Murrindindi Shire locations for realistic test data
const TEST_LOCATIONS = [
    "Kilmore, VIC 3764",
    "Broadford, VIC 3658",
    "Seymour, VIC 3660",
    "Yea, VIC 3717",
    "Alexandra, VIC 3714",
    "Marysville, VIC 3779",
    "Wallan, VIC 3756",
    "Kinglake, VIC 3763",
    "Eildon, VIC 3713",
    "Healesville, VIC 3777"
];

const AGE_GROUPS = [
    { value: "teen", label: "Teen (13-17)", minAge: 13, maxAge: 17 },
    { value: "adult", label: "Adult (18-64)", minAge: 18, maxAge: 64 },
    { value: "senior", label: "Senior (65+)", minAge: 65, maxAge: 80 }
];

export default function CreateTestIndividualsPage() {
    const [count, setCount] = useState(1);
    const [ageGroup, setAgeGroup] = useState("adult");
    const [creating, setCreating] = useState(false);
    const [created, setCreated] = useState<string[]>([]);
    const router = useRouter();
    const { toast } = useToast();

    const handleCreate = async () => {
        setCreating(true);
        try {
            const res = await fetch("/admin/api/testing/individuals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ count, ageGroup })
            });

            if (res.ok) {
                const data = await res.json();
                setCreated(prev => [...prev, ...data.created]);
                toast({
                    title: "Success",
                    description: `Created ${data.created.length} test individual(s)`
                });
            } else {
                const error = await res.json();
                toast({
                    title: "Error",
                    description: error.message || "Failed to create test individuals",
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
            setCreating(false);
        }
    };

    return (
        <div className="flex-1 space-y-6 pt-2">
            <div className="flex items-center gap-4">
                <Link href="/admin/testing">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500 p-2 rounded-lg text-white">
                        <User className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Create Test Individuals</h2>
                        <p className="text-muted-foreground">
                            Generate test user accounts for E2E testing
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Test Individuals</CardTitle>
                        <CardDescription>
                            Test accounts will use <code>@smalltalk.test</code> email domain
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="count">Number to create</Label>
                            <Input
                                id="count"
                                type="number"
                                min={1}
                                max={10}
                                value={count}
                                onChange={(e) => setCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                            />
                            <p className="text-xs text-muted-foreground">Maximum 10 at a time</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ageGroup">Age Group</Label>
                            <Select value={ageGroup} onValueChange={setAgeGroup}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select age group" />
                                </SelectTrigger>
                                <SelectContent>
                                    {AGE_GROUPS.map(group => (
                                        <SelectItem key={group.value} value={group.value}>
                                            {group.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-2">
                            <p className="text-sm text-muted-foreground mb-2">
                                Test individuals will have:
                            </p>
                            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                <li>Email: <code>test-[uuid]@smalltalk.test</code></li>
                                <li>Random name from Australian name pool</li>
                                <li>Location in Mitchell/Murrindindi Shire</li>
                                <li>Date of birth matching selected age group</li>
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={handleCreate}
                            disabled={creating}
                            className="w-full"
                        >
                            {creating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create {count} Test Individual{count > 1 ? 's' : ''}
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recently Created</CardTitle>
                        <CardDescription>
                            Test individuals created this session
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {created.length > 0 ? (
                            <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                                {created.map((email, i) => (
                                    <li key={i} className="text-sm bg-muted p-2 rounded font-mono">
                                        {email}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                No test individuals created yet
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Available Test Locations</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {TEST_LOCATIONS.map(location => (
                            <span
                                key={location}
                                className="text-xs bg-muted px-2 py-1 rounded-full"
                            >
                                {location}
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
