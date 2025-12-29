"use client";

import { useEffect, useState } from "react";
import { PlatformHeader } from "@/components/platform/PlatformHeader";
import { AppCard, AppData } from "@/components/platform/AppCard";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
    const [apps, setApps] = useState<AppData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchUserApps() {
            try {
                const res = await fetch("/api/user/apps");
                const data = await res.json();
                if (Array.isArray(data)) {
                    setApps(data);
                }
            } catch (error) {
                console.error(error);
                toast({
                    title: "Error",
                    description: "Failed to load your apps.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchUserApps();
    }, [toast]);

    const handleRemoveApp = async (appId: string) => {
        try {
            const res = await fetch("/api/user/apps", {
                method: "DELETE",
                body: JSON.stringify({ appId })
            });
            if (res.ok) {
                setApps(prev => prev.filter(a => a.id !== appId));
                toast({
                    title: "App removed",
                    description: "Application removed from your dashboard."
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to remove app.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <PlatformHeader />
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
                    <Link href="/apps">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Apps
                        </Button>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                    </div>
                ) : apps.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {apps.map(app => (
                            <AppCard
                                key={app.id}
                                app={app}
                                variant="dashboard"
                                onRemove={() => handleRemoveApp(app.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed rounded-xl">
                        <h3 className="text-xl font-semibold mb-2">No apps installed</h3>
                        <p className="text-muted-foreground mb-6">Start by adding apps to your dashboard.</p>
                        <Link href="/apps">
                            <Button variant="secondary">Browse App Catalogue</Button>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
