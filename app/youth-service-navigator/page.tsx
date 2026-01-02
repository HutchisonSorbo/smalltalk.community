"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, AlertTriangle } from "lucide-react";

export default function YouthServiceNavigatorPage() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                <Heart className="w-10 h-10 text-white" />
            </div>

            {/* Hero */}
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4 leading-tight">
                Find Support That&apos;s Right For You
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Answer a few quick questions and we&apos;ll show you the fastest way to get help
                with mental health, wellbeing, and support services.
            </p>

            {/* Get Started Button */}
            <Button asChild size="lg" className="w-full max-w-xs mb-4">
                <Link href="/youth-service-navigator/intake">Get Started</Link>
            </Button>

            {/* Crisis Support Alert */}
            <Card className="bg-destructive/5 border-2 border-destructive mb-6 max-w-md mx-auto">
                <CardContent className="p-4">
                    <Link
                        href="#crisis"
                        className="text-destructive font-semibold flex items-center justify-center gap-2 hover:underline"
                    >
                        <AlertTriangle className="w-5 h-5" />
                        I need urgent help right now →
                    </Link>
                </CardContent>
            </Card>

            {/* Supporter Pathway */}
            <Link
                href="/youth-service-navigator/intake?supporter=true"
                className="text-primary text-sm hover:underline inline-flex items-center gap-2"
            >
                <Users className="w-4 h-4" />
                I&apos;m helping someone else
            </Link>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
                <div className="bg-accent rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">12-25</div>
                    <div className="text-sm text-muted-foreground">Age range</div>
                </div>
                <div className="bg-accent rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">100+</div>
                    <div className="text-sm text-muted-foreground">Services listed</div>
                </div>
                <div className="bg-accent rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">Free</div>
                    <div className="text-sm text-muted-foreground">To use</div>
                </div>
            </div>
        </div>
    );
}
