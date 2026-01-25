"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateTenantImpactStats } from "@/lib/communityos/actions";
import { Tenant } from "@/shared/schema";

export function ImpactSection({ tenant }: { tenant: Tenant }) {
    const [stats, setStats] = useState(tenant.impactStats || []);
    const [isSaving, setIsSaving] = useState(false);

    async function handleSave() {
        setIsSaving(true);
        try {
            const result = await updateTenantImpactStats(tenant.id, stats);
            if (result.success) {
                toast.success("Impact stats updated");
            } else {
                toast.error(result.error || "Update failed");
            }
        } catch (err) {
            console.error(`[ImpactSection] error for tenant ${tenant.id}:`, err);
            toast.error("An unexpected error occurred while saving impact stats");
        } finally {
            setIsSaving(false);
        }
    }

    const addStat = () => setStats([...stats, { label: "", value: "", icon: "star" }]);
    const removeStat = (index: number) => setStats(stats.filter((_, i) => i !== index));
    const updateStat = (index: number, key: string, val: string) => {
        const newStats = [...stats];
        (newStats[index] as any)[key] = val;
        setStats(newStats);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-bold">
                    <h2 className="text-xl font-bold inline">Impact Statistics</h2>
                </CardTitle>
                <CardDescription>Showcase your organisation's impact with key metrics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {stats.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        No stats added yet. Click the button below to add your first metric.
                    </div>
                )}
                {stats.map((stat, index) => (
                    <div key={index} className="flex flex-wrap items-end gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex-1 min-w-[120px] space-y-2">
                            <label
                                htmlFor={`stat-label-${index}`}
                                className="text-xs font-medium uppercase text-gray-500"
                            >
                                Label
                            </label>
                            <Input
                                id={`stat-label-${index}`}
                                value={stat.label}
                                onChange={(e) => updateStat(index, "label", e.target.value)}
                                placeholder="e.g. Members"
                            />
                        </div>
                        <div className="flex-1 min-w-[120px] space-y-2">
                            <label
                                htmlFor={`stat-value-${index}`}
                                className="text-xs font-medium uppercase text-gray-500"
                            >
                                Value
                            </label>
                            <Input
                                id={`stat-value-${index}`}
                                value={stat.value}
                                onChange={(e) => updateStat(index, "value", e.target.value)}
                                placeholder="e.g. 1,000+"
                            />
                        </div>
                        <div className="w-24 space-y-2">
                            <label
                                htmlFor={`stat-icon-${index}`}
                                className="text-xs font-medium uppercase text-gray-500"
                            >
                                Icon
                            </label>
                            <Input
                                id={`stat-icon-${index}`}
                                value={stat.icon}
                                onChange={(e) => updateStat(index, "icon", e.target.value)}
                                placeholder="Icon alias"
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeStat(index)}
                            className="text-red-500 hover:text-red-600 mb-[2px]"
                            aria-label={`Delete stat ${stat.label || index + 1}`}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button variant="outline" onClick={addStat} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Metric
                </Button>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isSaving || stats.length === 0}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Statistics
                </Button>
            </CardFooter>
        </Card>
    );
}
