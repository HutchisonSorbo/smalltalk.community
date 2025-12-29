"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { PlatformHeader } from "@/components/platform/PlatformHeader";
import { AppCard, AppData } from "@/components/platform/AppCard";
import dynamic from "next/dynamic";

const VictoriaMap = dynamic(() => import("@/components/local-music-network/VictoriaMap"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-xl" />
});

// Hardcoded apps for showcase until seed is ready/consistent
const SHOWCASE_APPS: AppData[] = [
    {
        id: "lmn",
        name: "Local Music Network",
        description: "The ultimate directory for Victorian musicians, bands, and gigs. Connect and collaborate.",
        iconUrl: "/icons/music-icon.png", // Placeholder
        route: "/local-music-network",
        category: "Music"
    },
    {
        id: "vp",
        name: "Volunteer Passport",
        description: "Your digital passport for verifying credentials and finding volunteer opportunities across Victoria.",
        iconUrl: "/icons/shield-icon.png", // Placeholder
        route: "/volunteer-passport",
        category: "Community"
    },
    {
        id: "mp",
        name: "Marketplace",
        description: "Buy, sell, and trade gear with verified locals. Safe, secure, and community-driven.",
        iconUrl: "/icons/zap-icon.png", // Placeholder
        route: "#",
        category: "Commerce",
        isBeta: true
    }
];

export function HubLanding() {
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

                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 pb-2">
                                smalltalk.community
                            </h1>

                            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                Your central launchpad for Victoria's creative tools, communities, and services. One account for everything.
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

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {SHOWCASE_APPS.map(app => (
                                <AppCard
                                    key={app.id}
                                    app={app}
                                    variant="showcase"
                                />
                            ))}
                        </div>
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
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2 font-bold text-xl mb-4 text-foreground">
                        <span className="h-4 w-4 rounded-full bg-blue-500"></span>
                        smalltalk.community
                    </div>
                    <p className="text-sm">
                        &copy; {new Date().getFullYear()} Hutchison Sorbo. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}


// CodeRabbit Audit Trigger
