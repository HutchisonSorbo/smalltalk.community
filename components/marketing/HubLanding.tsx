"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Music, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HubLanding() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            {/* Hero Section */}
            <main className="flex flex-col items-center justify-center px-4 pt-24 pb-12 text-center sm:pt-40">
                <div className="animate-fade-in-up space-y-8">
                    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-white/80 backdrop-blur-xl">
                        <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
                        Community Hub Beta
                    </div>
                    
                    <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                        smalltalk.community
                    </h1>
                    
                    <p className="mx-auto max-w-2xl text-lg text-neutral-400 sm:text-xl leading-relaxed">
                        The central home for Victorian creative communities. Experience the future of local connection, starting with our flagship music network.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/vic-band">
                            <Button size="lg" className="h-12 px-8 text-base rounded-full bg-white text-black hover:bg-neutral-200 transition-all font-semibold group">
                                Launch Vic Band App
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                        <Button variant="outline" size="lg" className="h-12 px-8 text-base rounded-full border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white" disabled>
                            More Apps Coming Soon
                        </Button>
                    </div>
                </div>
            </main>

            {/* Feature Grid */}
            <section className="px-4 py-24 mx-auto max-w-7xl">
                <div className="grid gap-8 md:grid-cols-3">
                    <FeatureCard 
                        icon={<Music className="h-6 w-6 text-purple-400" />}
                        title="Vic Band"
                        description="The ultimate simplified toolkit for Victorian bands and musicians. Connect, book gigs, and manage your profile."
                        link="/vic-band"
                        linkText="Enter App"
                    />
                    <FeatureCard 
                        icon={<Users className="h-6 w-6 text-blue-400" />}
                        title="Community First"
                        description="Built by locals, for locals. A safe, verified space to collaborate and grow without the noise of global social media."
                    />
                    <FeatureCard 
                        icon={<Zap className="h-6 w-6 text-yellow-400" />}
                        title="Modern Platform"
                        description="Experience a lightning-fast, ad-free environment designed for creativity and genuine connection."
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 text-center text-neutral-500 text-sm border-t border-white/5">
                <p>© {new Date().getFullYear()} smalltalk.community. All rights reserved.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description, link, linkText }: { icon: React.ReactNode, title: string, description: string, link?: string, linkText?: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
            <p className="text-neutral-400 leading-relaxed mb-4">{description}</p>
            {link && (
                <Link href={link} className="text-sm font-medium text-white hover:text-purple-400 transition-colors inline-flex items-center">
                    {linkText} <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
            )}
        </div>
    );
}
