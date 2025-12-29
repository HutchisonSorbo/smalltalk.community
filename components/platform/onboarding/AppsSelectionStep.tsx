"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppCard, AppData } from "@/components/platform/AppCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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
                    // Default select Local Music Network if it exists
                    const lmn = data.find(a => a.name.includes("Music") || a.route.includes("local-music-network"));
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

        // We add apps one by one. In a real app we might want a bulk endpoint.
        // For now we iterate.
        // We assume the API /api/user/apps/route.ts handles POST to add.
        // Current route POST just adds one.
        // We should probably optimize this in the future, but <10 apps is fine.

        // We also need to mark onboardingCompleted.
        // We can do that via a separate call or update the user API.
        // Let's call /api/user/account-type to update onboarding status? Or create a dedicated endpoint.

        try {
            const promises = Array.from(selectedAppIds).map(appId =>
                fetch("/api/user/apps", {
                    method: "POST",
                    body: JSON.stringify({ appId }),
                })
            );

            await Promise.all(promises);

            // Mark onboarding complete
            // We'll reuse the account-type endpoint or a new one?
            // Let's create `api/user/complete-onboarding` for clarity or just update users table.
            // Actually, I can just update the user here via a new server action or API.
            // I'll make a quick call to `/api/user/account-type` (which I created to update user) 
            // OR simply redirect to Welcome page which might handle the finalization?
            // Implementation plan says "Welcome Message ... to conclude onboarding".

            // I'll add a 'onboardingCompleted: true' field update to the account-type route?
            // My `updateAccountTypeSchema` was strict. 
            // I'll quickly Create a new simple route `api/user/complete-onboarding` or just use the PATCH user route if I modify it.
            // Modifying the route is better.

        } catch (e) {
            console.error(e);
            errorOccurred = true;
        }

        if (!errorOccurred) {
            router.push("/onboarding/welcome");
        } else {
            setIsSubmitting(false);
            toast({
                title: "Error",
                description: "Failed to save selection.",
                variant: "destructive",
            });
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
