"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Users, ArrowRight } from "lucide-react";

interface WelcomeStepProps {
    onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                    <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Welcome to smalltalk.community
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg mx-auto">
                    A platform designed for young Victorians to connect, learn, and thrive.
                </p>
            </div>

            {/* Value Props */}
            <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
                <div className="flex flex-col items-center p-6 rounded-xl bg-card border border-border text-center space-y-3">
                    <div className="p-3 rounded-full bg-blue-500/10">
                        <Users className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="font-semibold">Connect</h3>
                    <p className="text-sm text-muted-foreground">
                        Find peers, mentors, and opportunities in your community
                    </p>
                </div>

                <div className="flex flex-col items-center p-6 rounded-xl bg-card border border-border text-center space-y-3">
                    <div className="p-3 rounded-full bg-green-500/10">
                        <Sparkles className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="font-semibold">Discover</h3>
                    <p className="text-sm text-muted-foreground">
                        Apps for music, careers, wellbeing, and volunteering
                    </p>
                </div>

                <div className="flex flex-col items-center p-6 rounded-xl bg-card border border-border text-center space-y-3">
                    <div className="p-3 rounded-full bg-purple-500/10">
                        <Shield className="h-6 w-6 text-purple-500" />
                    </div>
                    <h3 className="font-semibold">Safe Space</h3>
                    <p className="text-sm text-muted-foreground">
                        Your privacy matters. You control what you share.
                    </p>
                </div>
            </div>

            {/* CTA */}
            <div className="text-center space-y-4 pt-4">
                <p className="text-muted-foreground">
                    Let&apos;s personalize your experience in just a few steps.
                </p>
                <Button
                    size="lg"
                    onClick={onNext}
                    className="min-w-[200px] gap-2"
                >
                    Get Started <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="text-xs text-muted-foreground">
                    Takes about 2 minutes
                </p>
            </div>
        </div>
    );
}
