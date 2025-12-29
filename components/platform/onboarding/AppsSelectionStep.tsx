"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppCard, AppData } from "@/components/platform/AppCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight } from "lucide-react";

export function AppsSelectionStep() {
    const [apps, setApps] = useState<AppData[]>([]);
    const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        async function fetchApps() {
            try {
                const res = await fetch("/api/apps");
                const data = await res.json();
                // Ensure data is array
                if (Array.isArray(data)) {
                    setApps(data);
                    // Default select Local Music Network by route
                    const lmn = data.find(a => a.route === "/local-music-network");
                    if (lmn) {
                        setSelectedAppIds(new Set([lmn.id]));
                    }
                }
            } catch (error) {
                console.error("Failed to load apps", error);
                toast({
                    title: "Error",
                    description: "Failed to load available apps.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchApps();
    }, [toast]);

    const toggleApp = (id: string) => {
        const newSet = new Set(selectedAppIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedAppIds(newSet);
    };

    const handleNext = async () => {
        if (selectedAppIds.size === 0) {
            toast({
                title: "Selection required",
                description: "Please select at least one app to get started.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        let errorOccurred = false;

        // Add selected apps via API and mark onboarding complete; consider batching in future
        try {
            const results = await Promise.allSettled(
                Array.from(selectedAppIds).map(async (appId) => {
                    const res = await fetch("/api/user/apps", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ appId }),
                    });
                    if (!res.ok) throw new Error(`Failed to add app ${appId}: ${res.statusText}`);
                    return appId;
                })
            );

            const failed = results.filter((r) => r.status === "rejected");

            if (failed.length > 0) {
                console.error("Some apps failed to install:", failed);
                errorOccurred = true;
                toast({
                    title: "Partial Success",
                    description: `${failed.length} app(s) could not be added. Please try again.`,
                    variant: "destructive",
                });
            }

        } catch (e) {
            console.error("Unexpected error during submission:", e);
            errorOccurred = true;
        }

        if (!errorOccurred) {
            router.push("/onboarding/welcome");
        } else if (errorOccurred && selectedAppIds.size > 0 && !isSubmitting) {
            // If we already showed a toast for partial failure, we might strictly stop.
            // But the original code just set isSubmitting(false) in the else block.
            // We need to ensure we don't act as if totally successful if there were errors.
        } else {
            // Fallback generic error if not handled above (e.g. unexpected catch)
            if (!errorOccurred) {
                // Should not happen if logic holds, but keeps TS happy if we re-flag
            }
        }

        // Final cleanup
        if (errorOccurred) {
            setIsSubmitting(false);
            if (handleNext.length === 0) { // Just a dummy check to keep logic block structure or just remove
            }
        }
    };

    if (isLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Choose your Apps</h1>
                <p className="text-muted-foreground text-lg">
                    Select the communities and tools you want to connect with.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {apps.map((app) => (
                    <AppCard
                        key={app.id}
                        app={app}
                        variant="onboarding"
                        isSelected={selectedAppIds.has(app.id)}
                        onToggle={toggleApp}
                    />
                ))}
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    Back
                </Button>
                <Button
                    size="lg"
                    onClick={handleNext}
                    disabled={selectedAppIds.size === 0 || isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            Finish Setup <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
