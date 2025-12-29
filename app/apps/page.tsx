"use client";

import { useEffect, useState } from "react";
import { PlatformHeader } from "@/components/platform/PlatformHeader";
import { AppCard, AppData } from "@/components/platform/AppCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AppsPage() {
    const [allApps, setAllApps] = useState<AppData[]>([]);
    const [userAppIds, setUserAppIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        async function loadData() {
            try {
                // Parallel fetch
                const [appsRes, userAppsRes] = await Promise.all([
                    fetch("/api/apps"),
                    fetch("/api/user/apps")
                ]);

                const appsData = await appsRes.json();
                const userAppsData = await userAppsRes.json();

                if (Array.isArray(appsData)) setAllApps(appsData);
                if (Array.isArray(userAppsData)) {
                    setUserAppIds(new Set(userAppsData.map((a: any) => a.id)));
                }
            } catch (error) {
                console.error(error);
                toast({
                    title: "Error",
                    description: "Failed to load apps.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [toast]);

    const handleAddApp = async (appId: string) => {
        try {
            const res = await fetch("/api/user/apps", {
                method: "POST",
                body: JSON.stringify({ appId })
            });
            if (res.ok) {
                const newSet = new Set(userAppIds);
                newSet.add(appId);
                setUserAppIds(newSet);
                toast({ title: "App added" });
            }
        } catch (e) {
            console.error(e);
            toast({ title: "Error adding app", variant: "destructive" });
        }
    };

    const handleRemoveApp = async (appId: string) => {
        try {
            const res = await fetch("/api/user/apps", {
                method: "DELETE",
                body: JSON.stringify({ appId })
            });
            if (res.ok) {
                const newSet = new Set(userAppIds);
                newSet.delete(appId);
                setUserAppIds(newSet);
                toast({ title: "App removed" });
            }
        } catch (e) {
            console.error(e);
            toast({ title: "Error removing app", variant: "destructive" });
        }
    };

    const filteredApps = allApps.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const myApps = filteredApps.filter(app => userAppIds.has(app.id));
    const availableApps = filteredApps.filter(app => !userAppIds.has(app.id));

    return (
        <div className="min-h-screen bg-background">
            <PlatformHeader />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight">App Catalogue</h1>
                    <div className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search apps..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                    </div>
                ) : (
                    <Tabs defaultValue="available" className="space-y-8">
                        <TabsList>
                            <TabsTrigger value="available">Available Apps ({availableApps.length})</TabsTrigger>
                            <TabsTrigger value="installed">Installed ({myApps.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="available" className="space-y-4">
                            {availableApps.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {availableApps.map(app => (
                                        <AppCard
                                            key={app.id}
                                            app={app}
                                            variant="catalogue"
                                            isInstalled={false}
                                            onAdd={() => handleAddApp(app.id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground py-8">No matching apps found.</p>
                            )}
                        </TabsContent>

                        <TabsContent value="installed" className="space-y-4">
                            {myApps.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {myApps.map(app => (
                                        <AppCard
                                            key={app.id}
                                            app={app}
                                            variant="catalogue"
                                            isInstalled={true}
                                            onRemove={() => handleRemoveApp(app.id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground py-8">You haven't installed any apps yet.</p>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </main>
        </div>
    );
}
