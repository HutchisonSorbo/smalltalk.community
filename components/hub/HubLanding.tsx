"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Music2, Users, Radio, ShieldCheck, Zap } from "lucide-react";
import { HubHeader } from "./HubHeader";

export function HubLanding() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-purple-500 selection:text-white">
            <HubHeader />

            <main>
                {/* Hero Section */}
                <section className="relative pt-20 pb-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent pointer-events-none" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center space-y-8">
                            <div className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                                <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                                Ecosystem Live
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 pb-2">
                                smalltalk.community hub
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
                            <FeatureCard
                                icon={<Music2 className="h-6 w-6 text-purple-500" />}
                                title="vic.band"
                                description="The ultimate directory for Victorian musicians, bands, and gigs. Connect and collaborate."
                                link="/vic-band"
                                linkText="Launch App"
                            />
                            <FeatureCard
                                icon={<Radio className="h-6 w-6 text-blue-500" />}
                                title="Community Vote"
                                description="Have your say. Participate in community polls and help shape the future of the scene."
                                link="#"
                                linkText="Coming Soon"
                                disabled
                            />
                            <FeatureCard
                                icon={<Zap className="h-6 w-6 text-yellow-500" />}
                                title="Marketplace"
                                description="Buy, sell, and trade gear with verified locals. Safe, secure, and community-driven."
                                link="#"
                                linkText="Coming Soon"
                                disabled
                            />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-blue-900/10" />
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
                        <span className="h-4 w-4 rounded-full bg-purple-500"></span>
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

function FeatureCard({ icon, title, description, link, linkText, disabled }: { icon: React.ReactNode, title: string, description: string, link?: string, linkText?: string, disabled?: boolean }) {
    return (
        <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors shadow-sm flex flex-col h-full">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
            <p className="text-muted-foreground leading-relaxed mb-6 flex-1">{description}</p>
            {link && (
                <div className="mt-auto">
                    {disabled ? (
                        <span className="text-sm font-medium text-muted-foreground inline-flex items-center cursor-not-allowed opacity-70">
                            {linkText}
                        </span>
                    ) : (
                        <Link href={link} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center">
                            {linkText} <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
