"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { PlatformHeader } from "@/components/platform/PlatformHeader";
import { AppCard, AppData } from "@/components/platform/AppCard";
import dynamic from "next/dynamic";
import { safeUrl } from "@/lib/utils";

const VictoriaMap = dynamic(() => import("@/components/local-music-network/VictoriaMap"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-xl" />
});

// Fallback apps in case DB fetch fails
const FALLBACK_APPS: AppData[] = [
    {
        id: "lmn",
        name: "Local Music Network",
        description: "The ultimate directory for Victorian musicians, bands, and gigs. Connect and collaborate.",
        iconUrl: "/icons/music-icon.png",
        route: "/local-music-network",
        category: "Music"
    },
    {
        id: "vp",
        name: "Volunteer Passport",
        description: "Your digital passport for verifying credentials and finding volunteer opportunities across Victoria.",
        iconUrl: "/icons/shield-icon.png",
        route: "/volunteer-passport",
        category: "Community"
    },
];

export function HubLanding() {
    const [apps, setApps] = useState<AppData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchApps() {
            try {
                const res = await fetch("/api/apps");
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    // Map to AppData format and filter active apps
                    const mappedApps: AppData[] = data
                        .filter((app: Record<string, unknown>) => app.isActive)
                        .slice(0, 6) // Show max 6 on landing
                        .map((app: Record<string, unknown>) => ({
                            id: app.id as string,
                            name: app.name as string,
                            description: app.description as string,
                            iconUrl: app.iconUrl as string,
                            route: app.route as string || "#",
                            category: app.category as string,
                            isBeta: app.isBeta as boolean,
                        }));
                    setApps(mappedApps.length > 0 ? mappedApps : FALLBACK_APPS);
                } else {
                    setApps(FALLBACK_APPS);
                }
            } catch (error) {
                console.error("Failed to fetch apps:", error);
                setApps(FALLBACK_APPS);
            } finally {
                setIsLoading(false);
            }
        }
        fetchApps();
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-blue-500 selection:text-white">
            <PlatformHeader />

            <main>
                {/* Hero Section */}
                <section className="relative pt-20 pb-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center space-y-8">
                            <div className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                                <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                                Ecosystem Live
                            </div>

                            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 pb-2 break-words sm:break-normal">
                                smalltalk.community
                            </h1>

                            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                Your central launchpad for Victoria&apos;s creative tools, communities, and services. One account for everything.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <Link href="/login">
                                    <Button size="lg" className="h-12 px-8 text-lg rounded-full">
                                        Create Account <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="#apps">
                                    <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full">
                                        Explore Apps
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Apps Grid */}
                <section id="apps" className="py-24 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">Our Application Suite</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Access all your community tools from one dashboard.
                            </p>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                {apps.map(app => (
                                    <AppCard
                                        key={app.id}
                                        app={app}
                                        variant="showcase"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Community Map Section */}
                <section className="py-24 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Explore the Community</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                See where musicians and professionals are located across Victoria.
                            </p>
                        </div>
                        <div className="max-w-5xl mx-auto border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <VictoriaMap />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-cyan-900/10" />
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <h2 className="text-4xl font-bold mb-6">One Identity. Endless Possibilities.</h2>
                        <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
                            Join thousands of Victorian creatives building the future of our local community.
                        </p>
                        <Link href="/login">
                            <Button size="lg" className="h-14 px-10 text-xl rounded-full shadow-lg hover:shadow-xl transition-all">
                                Get Started Now
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t py-12 bg-muted/50">
                <div className="container mx-auto px-4">
                    {/* First Nations Acknowledgement */}
                    <div className="text-center mb-8 pb-8 border-b border-border/50">
                        <p className="text-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                            We acknowledge the Traditional Custodians of the lands where we live, work and connect.
                            We pay respects to Elders past and present, and extend that respect to all Aboriginal
                            and Torres Strait Islander peoples.
                        </p>
                    </div>

                    {/* Footer Navigation */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 font-bold text-xl mb-4 text-foreground">
                                <span className="h-4 w-4 rounded-full bg-blue-500"></span>
                                smalltalk.community
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Connecting Victorian communities through opportunities, skills, and meaningful connections.
                            </p>
                        </div>

                        <div className="text-center">
                            <h3 className="font-semibold mb-3 text-foreground">Quick Links</h3>
                            <nav className="flex flex-col gap-2">
                                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
                                <Link href="/accessibility" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Accessibility</Link>
                                <Link href="/apps" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Our Apps</Link>
                                <a href="mailto:hello@smalltalk.community" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact / Feedback</a>
                            </nav>
                        </div>

                        <div className="text-center md:text-right">
                            <h3 className="font-semibold mb-3 text-foreground">Crisis Support</h3>
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                <span>Emergency: <strong className="text-foreground">000</strong></span>
                                <span>Lifeline: <strong className="text-foreground">13 11 14</strong></span>
                                <span>Kids Helpline: <strong className="text-foreground">1800 551 800</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="text-center pt-8 border-t border-border/50">
                        <p className="text-sm text-muted-foreground">
                            &copy; {new Date().getFullYear()} Hutchison Sorbo. All rights reserved.
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            <a href={safeUrl("https://www.flaticon.com/free-icons/strong") || "#"} title="strong icons" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                Strong icons created by Freepik - Flaticon
                            </a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
