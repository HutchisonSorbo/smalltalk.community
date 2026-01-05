"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Music, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ENTITY_TYPES = [
    { value: "musician", label: "Musician Profile (Upgrade Users)" },
    { value: "band", label: "Band" }
];

export default function CreateTestMusicPage() {
    const [count, setCount] = useState(1);
    const [entityType, setEntityType] = useState("musician");
    const [creating, setCreating] = useState(false);
    const [created, setCreated] = useState<string[]>([]);
    const { toast } = useToast();

    const handleCreate = async () => {
        setCreating(true);
        try {
            const res = await fetch("/admin/api/testing/music", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ count, type: entityType })
            });

            if (res.ok) {
                const data = await res.json();
                setCreated(prev => [...prev, ...data.created]);
                toast({
                    title: "Success",
                    description: `Created ${data.created.length} test music entities`
                });
            } else {
                const error = await res.json();
                toast({
                    title: "Error",
                    description: error.message || "Failed to create music entities",
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
                    <div className="bg-purple-500 p-2 rounded-lg text-white">
                        <Music className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Create Test Music Entities</h2>
                        <p className="text-muted-foreground">
                            Generate musician profiles and bands
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Music Entities</CardTitle>
                        <CardDescription>
                            Upgrade existing test users to musicians or create bands
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
                            <Label htmlFor="entityType">Entity Type</Label>
                            <Select value={entityType} onValueChange={setEntityType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ENTITY_TYPES.map(type => (
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
                                {entityType === "musician" ? (
                                    <>
                                        <li>Requires existing <strong>Test Individuals</strong></li>
                                        <li>Adds musician profiles to users who don't have one</li>
                                        <li>Assigns random instruments and genres</li>
                                    </>
                                ) : (
                                    <>
                                        <li>Requires existing <strong>Test Individuals</strong></li>
                                        <li>Creates bands owned by test users</li>
                                        <li>Generates band names and genres</li>
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
                                    Create {count} {entityType === 'musician' ? 'Profiles' : 'Bands'}
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recently Created</CardTitle>
                        <CardDescription>
                            Entities created this session
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {created.length > 0 ? (
                            <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                                {created.map((name, i) => (
                                    <li key={i} className="text-sm bg-muted p-2 rounded font-mono">
                                        {name}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                No test entities created yet
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
