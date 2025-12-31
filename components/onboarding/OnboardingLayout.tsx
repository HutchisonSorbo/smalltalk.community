import React from "react";
import { OnboardingProgress } from "./OnboardingProgress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

interface OnboardingLayoutProps {
    children: React.ReactNode;
    currentStep: number;
    totalSteps: number;
    title: string;
    description?: string;
    className?: string;
}

export function OnboardingLayout({
    children,
    currentStep,
    totalSteps,
    title,
    description,
    className
}: OnboardingLayoutProps) {

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
            <div className="w-full max-w-2xl space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="text-2xl font-bold text-primary">smalltalk.community</Link>
                    {/* Optional: Help/Support link */}
                </div>

                <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />

                <Card className={className}>
                    <CardHeader>
                        <CardTitle className="text-2xl">{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        {children}
                    </CardContent>
                </Card>

                <div className="text-center text-sm text-muted-foreground mt-4">
                    <p>Need help? <Link href="/support" className="underline hover:text-primary">Contact Support</Link></p>
                </div>
            </div>
        </div>
    );
}
