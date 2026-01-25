"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateTenantTeam } from "@/lib/communityos/actions";
import { Tenant } from "@/shared/schema";

export function TeamSection({ tenant }: { tenant: Tenant }) {
    const [team, setTeam] = useState(tenant.teamMembers || []);
    const [isSaving, setIsSaving] = useState(false);

    async function handleSave() {
        setIsSaving(true);
        try {
            const result = await updateTenantTeam(tenant.id, team);
            if (result.success) toast.success("Team updated");
            else toast.error(result.error || "Update failed");
        } catch (err) {
            console.error(`[TeamSection] error for tenant ${tenant.id}:`, err);
            toast.error("Failed to save team member information");
        } finally {
            setIsSaving(false);
        }
    }

    const addMember = () => setTeam([...team, { name: "", title: "" }]);
    const removeMember = (index: number) => setTeam(team.filter((_, i) => i !== index));
    const updateMember = (index: number, key: string, val: string) => {
        const newItems = [...team];
        (newItems[index] as any)[key] = val;
        setTeam(newItems);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-bold">
                    <h2 className="text-xl font-bold inline">Team Members</h2>
                </CardTitle>
                <CardDescription>Introduce your leadership and key staff.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {team.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        No team members listed. Click the button below to add your team leadership.
                    </div>
                )}
                {team.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 relative">
                        <div className="space-y-2">
                            <label htmlFor={`member-name-${index}`} className="text-xs font-medium text-gray-500">Full Name</label>
                            <Input
                                id={`member-name-${index}`}
                                value={item.name}
                                onChange={(e) => updateMember(index, "name", e.target.value)}
                                placeholder="Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor={`member-title-${index}`} className="text-xs font-medium text-gray-500">Role / Title</label>
                            <Input
                                id={`member-title-${index}`}
                                value={item.title}
                                onChange={(e) => updateMember(index, "title", e.target.value)}
                                placeholder="e.g. Executive Director"
                            />
                        </div>
                        <div className="md:col-span-2 flex gap-2 items-end">
                            <div className="flex-1 space-y-2">
                                <label htmlFor={`member-linkedin-${index}`} className="text-xs font-medium text-gray-500">LinkedIn Profile (Optional)</label>
                                <Input
                                    id={`member-linkedin-${index}`}
                                    value={item.linkedinUrl}
                                    onChange={(e) => updateMember(index, "linkedinUrl", e.target.value)}
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMember(index)}
                                className="text-red-500 mb-[2px]"
                                aria-label={`Delete team member ${item.name || index + 1}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                <Button variant="outline" onClick={addMember} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Team Member
                </Button>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isSaving || team.length === 0}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Team
                </Button>
            </CardFooter>
        </Card>
    );
}
