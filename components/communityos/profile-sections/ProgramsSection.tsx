"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateTenantPrograms } from "@/lib/communityos/actions";
import { Tenant } from "@/shared/schema";

export function ProgramsSection({ tenant }: { tenant: Tenant }) {
    const [programs, setPrograms] = useState(tenant.programs || []);
    const [isSaving, setIsSaving] = useState(false);

    async function handleSave() {
        setIsSaving(true);
        try {
            const result = await updateTenantPrograms(tenant.id, programs);
            if (result.success) toast.success("Programs updated");
            else toast.error(result.error || "Update failed");
        } catch (err) {
            console.error(`[ProgramsSection] error for tenant ${tenant.id}:`, err);
            toast.error("Failed to save programs information");
        } finally {
            setIsSaving(false);
        }
    }

    const addProgram = () => setPrograms([...programs, { title: "", description: "" }]);
    const removeProgram = (index: number) => setPrograms(programs.filter((_, i) => i !== index));
    const updateProgram = (index: number, key: string, val: string) => {
        const newItems = [...programs];
        (newItems[index] as any)[key] = val;
        setPrograms(newItems);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-bold">
                    <h2 className="text-xl font-bold inline">Programs & Services</h2>
                </CardTitle>
                <CardDescription>Highlight what your organisation offers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {programs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        No programs added yet. Click the button below to showcase your services.
                    </div>
                )}
                {programs.map((item, index) => (
                    <div key={index} className="space-y-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold">Program #{index + 1}</h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeProgram(index)}
                                className="text-red-500"
                                aria-label={`Delete program ${item.title || index + 1}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor={`prog-title-${index}`} className="text-xs font-medium text-gray-500">Title</label>
                            <Input id={`prog-title-${index}`} value={item.title} onChange={(e) => updateProgram(index, "title", e.target.value)} placeholder="Program Title" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor={`prog-desc-${index}`} className="text-xs font-medium text-gray-500">Description</label>
                            <Textarea id={`prog-desc-${index}`} value={item.description} onChange={(e) => updateProgram(index, "description", e.target.value)} placeholder="Description..." />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor={`prog-url-${index}`} className="text-xs font-medium text-gray-500">Learn More Link (Optional)</label>
                            <Input id={`prog-url-${index}`} value={item.linkUrl} onChange={(e) => updateProgram(index, "linkUrl", e.target.value)} placeholder="https://..." />
                        </div>
                    </div>
                ))}
                <Button variant="outline" onClick={addProgram} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Program
                </Button>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isSaving || programs.length === 0}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Programs
                </Button>
            </CardFooter>
        </Card>
    );
}
