"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Loader2, Plus, Music, Heart, Briefcase } from "lucide-react";
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

const ACCOUNT_TYPES = [
    { value: "Individual", label: "Individual" },
    { value: "Business", label: "Business" },
    { value: "Government Organisation", label: "Government Organisation" },
    { value: "Charity", label: "Charity" },
    { value: "Other", label: "Other" }
];

const ONBOARDING_STATES = [
    { value: "not_started", label: "Not Started (Step 0)" },
    { value: "in_progress", label: "In Progress (Step 3)" },
    { value: "completed", label: "Completed" }
];

export default function CreateTestIndividualsPage() {
    const [count, setCount] = useState(1);
    const [ageGroup, setAgeGroup] = useState("adult");
    const [accountType, setAccountType] = useState("Individual");
    const [onboardingState, setOnboardingState] = useState("completed");
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMinor, setIsMinor] = useState(false);

    // Profile toggles
    const [createMusicianProfile, setCreateMusicianProfile] = useState(false);
    const [createVolunteerProfile, setCreateVolunteerProfile] = useState(false);
    const [createProfessionalProfile, setCreateProfessionalProfile] = useState(false);

    const [creating, setCreating] = useState(false);
    const [created, setCreated] = useState<Array<{ email: string; profiles: string[] }>>([]);
    const router = useRouter();
    const { toast } = useToast();

    // Auto-set isMinor when teen age group is selected
    const handleAgeGroupChange = (value: string) => {
        setAgeGroup(value);
        if (value === "teen") {
            setIsMinor(true);
        }
    };

    const handleCreate = async () => {
        setCreating(true);
        try {
            const res = await fetch("/admin/api/testing/individuals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    count,
                    ageGroup,
                    accountType,
                    onboardingState,
                    isAdmin,
                    isMinor: ageGroup === "teen" ? true : isMinor,
                    profiles: {
                        musician: createMusicianProfile,
                        volunteer: createVolunteerProfile,
                        professional: createProfessionalProfile
                    }
                })
            });

            if (res.ok) {
                const data = await res.json();
                setCreated(prev => [...prev, ...data.created.map((email: string, index: number) => ({
                    email,
                    // Use server-confirmed profile count - if profiles were created, show the types that were requested
                    profiles: data.profilesCreated > 0 ? [
                        createMusicianProfile ? "Musician" : null,
                        createVolunteerProfile ? "Volunteer" : null,
                        createProfessionalProfile ? "Professional" : null
                    ].filter(Boolean) as string[] : []
                }))]);
                toast({
                    title: "Success",
                    description: `Created ${data.created.length} test individual(s)${data.profilesCreated ? ` with ${data.profilesCreated} profiles` : ""}`
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
                            Generate detailed test user accounts for E2E testing
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
                    <CardContent className="space-y-6">
                        {/* Basic Settings */}
                        <div className="grid grid-cols-2 gap-4">
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
                                <p className="text-xs text-muted-foreground">Maximum 10</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ageGroup">Age Group</Label>
                                <Select value={ageGroup} onValueChange={handleAgeGroupChange}>
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
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="accountType">Account Type</Label>
                                <Select value={accountType} onValueChange={setAccountType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ACCOUNT_TYPES.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="onboardingState">Onboarding State</Label>
                                <Select value={onboardingState} onValueChange={setOnboardingState}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select state" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ONBOARDING_STATES.map(state => (
                                            <SelectItem key={state.value} value={state.value}>
                                                {state.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Separator />

                        {/* User Flags */}
                        <div className="space-y-3">
                            <Label className="text-base">User Flags</Label>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isMinor"
                                        checked={ageGroup === "teen" ? true : isMinor}
                                        disabled={ageGroup === "teen"}
                                        onCheckedChange={(checked) => setIsMinor(checked === true)}
                                    />
                                    <Label htmlFor="isMinor" className="text-sm font-normal cursor-pointer">
                                        Mark as Minor {ageGroup === "teen" && "(auto-enabled for teens)"}
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isAdmin"
                                        checked={isAdmin}
                                        onCheckedChange={(checked) => setIsAdmin(checked === true)}
                                    />
                                    <Label htmlFor="isAdmin" className="text-sm font-normal cursor-pointer">
                                        Grant Admin Access
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Profile Types */}
                        <div className="space-y-3">
                            <Label className="text-base">Create Profiles</Label>
                            <p className="text-xs text-muted-foreground">
                                Optionally create associated profiles for each test user
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${createMusicianProfile
                                        ? "border-purple-500 bg-purple-500/10"
                                        : "border-muted hover:border-muted-foreground/50"
                                        }`}
                                    onClick={() => setCreateMusicianProfile(!createMusicianProfile)}
                                    aria-pressed={createMusicianProfile}
                                    aria-label="Toggle Musician profile creation"
                                >
                                    <Music className={`h-6 w-6 ${createMusicianProfile ? "text-purple-500" : "text-muted-foreground"}`} />
                                    <span className="text-xs font-medium">Musician</span>
                                </button>
                                <button
                                    type="button"
                                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${createVolunteerProfile
                                        ? "border-red-500 bg-red-500/10"
                                        : "border-muted hover:border-muted-foreground/50"
                                        }`}
                                    onClick={() => setCreateVolunteerProfile(!createVolunteerProfile)}
                                    aria-pressed={createVolunteerProfile}
                                    aria-label="Toggle Volunteer profile creation"
                                >
                                    <Heart className={`h-6 w-6 ${createVolunteerProfile ? "text-red-500" : "text-muted-foreground"}`} />
                                    <span className="text-xs font-medium">Volunteer</span>
                                </button>
                                <button
                                    type="button"
                                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${createProfessionalProfile
                                        ? "border-blue-500 bg-blue-500/10"
                                        : "border-muted hover:border-muted-foreground/50"
                                        }`}
                                    onClick={() => setCreateProfessionalProfile(!createProfessionalProfile)}
                                    aria-pressed={createProfessionalProfile}
                                    aria-label="Toggle Professional profile creation"
                                >
                                    <Briefcase className={`h-6 w-6 ${createProfessionalProfile ? "text-blue-500" : "text-muted-foreground"}`} />
                                    <span className="text-xs font-medium">Professional</span>
                                </button>
                            </div>
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
                            <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                                {created.map((item, i) => (
                                    <li key={i} className="text-sm bg-muted p-3 rounded">
                                        <div className="font-mono text-xs">{item.email}</div>
                                        {item.profiles.length > 0 && (
                                            <div className="flex gap-1 mt-1">
                                                {item.profiles.map(p => (
                                                    <span key={p} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
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
