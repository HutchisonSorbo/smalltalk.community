"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Music2, Users, Radio, ShieldCheck, Zap } from "lucide-react";
import { HubHeader } from "./HubHeader";
import { Footer } from "@/components/vic-band/Footer";

export function HubLanding() {
    return (
        <div className="flex min-h-screen flex-col">
            <HubHeader />
            
            <main className="flex-1">
                {/* Hero Section - Matching VicBand Landing Gradient Logic */}
                <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
                    
                    <div className="container mx-auto px-4 py-16 md:py-24 relative">
                        <div className="max-w-4xl mx-auto text-center space-y-8">
                             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium backdrop-blur-sm">
                                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                Live Beta Access
                            </div>
                            
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                                Where Victorian Music <span className="text-primary">Connects</span>.
                            </h1>
                            
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                Join the largest verified community of musicians, bands, and industry professionals in Victoria.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <Link href="/login">
                                    <Button size="lg" className="h-12 px-8 text-lg rounded-full">
                                        Join the Community <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/vic-band">
                                    <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full">
                                        Browse Directory
                                    </</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
                </section>

                {/* Features Grid - Matching VicBand Section Spacing */}
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to gig.</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Built by musicians, for musicians. We're solving the fragmentation of the local music scene.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            <FeatureCard 
                                icon={<Users className="h-8 w-8 text-primary" />}
                                title="Musician Finder"
                                description="Find bandmates based on location, genre, and skill level. Verified profiles only."
                                link="/vic-band/musicians"
                                linkText="Find Musicians"
                            />
                            <FeatureCard 
                                icon={<Zap className="h-8 w-8 text-blue-500" />}
                                title="Digital Auditions"
                                description="Post and manage auditions with professional tools. No more lost DMs."
                                link="/vic-band/auditions"
                                linkText="Post Audition"
                            />
                            <FeatureCard 
                                icon={<ShieldCheck className="h-8 w-8 text-green-500" />}
                                title="Verified Professionals"
                                description="Connect with photographers, producers, and venues that are vetted by the community."
                                link="/vic-band/professionals"
                                linkText="Find Pros"
                            />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 md:py-24 relative overflow-hidden bg-muted/30">
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Stop playing alone.</h2>
                        <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
                            Create your free profile in under 2 minutes and start connecting with the scene.
                        </p>
                        <Link href="/login">
                             <Button size="lg" className="h-14 px-10 text-xl rounded-full shadow-lg hover:shadow-xl transition-all">
                                Get Started Now
                            </</Button>
                        </Link>
                    </div>
                </section>
            </main>
            
            <Footer />
        </div>
    );
}

function FeatureCard({ icon, title, description, link, linkText }: { icon: React.ReactNode, title: string, description: string, link?: string, linkText?: string }) {
    return (
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
             <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">{description}</p>
            {link && (
                <Link href={link} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center">
                    {linkText} <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
            )}
        </div>
    );
}
