"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Briefcase, Loader2, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const OPPORTUNITY_TYPES = [
    { value: "volunteer", label: "Volunteer Opportunity" },
    { value: "gig", label: "Music Gig" }
];

export default function CreateTestOpportunitiesPage() {
    const [count, setCount] = useState(1);
    const [oppType, setOppType] = useState("volunteer");
    const [creating, setCreating] = useState(false);
    const [created, setCreated] = useState<string[]>([]);
    const { toast } = useToast();

    const handleCreate = async () => {
        setCreating(true);
        try {
            const res = await fetch("/admin/api/testing/opportunities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ count, type: oppType })
            });

            if (res.ok) {
                const data = await res.json();
                setCreated(prev => [...prev, ...data.created]);
                toast({
                    title: "Success",
                    description: `Created ${data.created.length} test opportunities`
                });
            } else {
                const error = await res.json();
                toast({
                    title: "Error",
                    description: error.message || "Failed to create test opportunities",
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
                    <div className="bg-yellow-500 p-2 rounded-lg text-white">
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Create Test Opportunities</h2>
                        <p className="text-muted-foreground">
                            Generate test volunteer roles and music gigs
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Test Opportunities</CardTitle>
                            <CardDescription>
                                Create opportunities linked to existing test users/organisations
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
                                <Label htmlFor="oppType">Opportunity Type</Label>
                                <Select value={oppType} onValueChange={setOppType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {OPPORTUNITY_TYPES.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-2">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Notes:
                                </p>
                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                    {oppType === "volunteer" ? (
                                        <>
                                            <li>Requires existing <strong>Test Organisations</strong></li>
                                            <li>Will assign to random test organisation</li>
                                            <li>Creates 'Published' volunteer roles</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>Requires existing <strong>Test Individuals</strong></li>
                                            <li>Will assign to random test user</li>
                                            <li>Creates localized music gigs</li>
                                        </>
                                    )}
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
                                        Create {count} Opportunities
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Work Experience & Apprenticeships</AlertTitle>
                        <AlertDescription>
                            The Work Experience Hub and Apprenticeship Hub currently use hardcoded demo data.
                            Creating test data for these sections is not supported yet as they don't pull from the database.
                        </AlertDescription>
                    </Alert>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recently Created</CardTitle>
                        <CardDescription>
                            Opportunities created this session
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {created.length > 0 ? (
                            <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                                {created.map((name, i) => (
                                    <li key={i} className="text-sm bg-muted p-2 rounded font-mono">
                                        {name}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                No test opportunities created yet
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
