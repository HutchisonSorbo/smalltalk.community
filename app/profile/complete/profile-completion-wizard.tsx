"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, User, Shield, Bell, Building2, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

interface WizardUser {
    id: string;
    email?: string;
    user_metadata?: {
        full_name?: string;
        [key: string]: any;
    };
}

type Step = "personal" | "identity" | "preferences" | "account" | "done";

export function ProfileCompletionWizard({ user }: { user: WizardUser }) {
    const [currentStep, setCurrentStep] = useState<Step>("personal");
    const [progress, setProgress] = useState(20);
    const router = useRouter();

    const steps = [
        { id: "personal", title: "Personal Details", icon: User },
        { id: "identity", title: "Identity", icon: Shield },
        { id: "preferences", title: "Preferences", icon: Bell },
        { id: "account", title: "Account Type", icon: Building2 },
    ];

    const stepOrder: Step[] = ["personal", "identity", "preferences", "account", "done"];
    const progressMap: Record<Step, number> = {
        personal: 20,
        identity: 40,
        preferences: 60,
        account: 80,
        done: 100,
    };

    const handleNext = () => {
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex < stepOrder.length - 1) {
            const nextStep = stepOrder[currentIndex + 1];
            setCurrentStep(nextStep);
            setProgress(progressMap[nextStep]);
        }
    };

    const handleBack = () => {
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex > 0) {
            const prevStep = stepOrder[currentIndex - 1];
            setCurrentStep(prevStep);
            setProgress(progressMap[prevStep]);
        }
    };

    const handleFinish = () => {
        toast({
            title: "Profile completed!",
            description: "Redirecting you back to your dashboard.",
        });
        router.push("/dashboard");
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 py-12">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Complete Your Profile</h1>
                    {currentStep !== "done" && (
                        <span className="text-sm font-medium text-muted-foreground" aria-live="polite">
                            Step {steps.findIndex(s => s.id === currentStep) + 1} of {steps.length}
                        </span>
                    )}
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {steps.map((step, index) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = stepOrder.indexOf(currentStep) > stepOrder.indexOf(step.id as Step);

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "flex flex-col items-center gap-2",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                            aria-current={isActive ? "step" : undefined}
                        >
                            <div className={cn(
                                "h-10 w-10 rounded-full border-2 flex items-center justify-center transition-colors",
                                isActive ? "border-primary bg-primary/10" : isCompleted ? "border-primary bg-primary text-primary-foreground" : "border-muted"
                            )}>
                                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                            </div>
                            <span className="text-xs font-medium hidden sm:inline-block">{step.title}</span>
                        </div>
                    );
                })}
            </div>

            <Card className="min-h-[400px] flex flex-col">
                <CardContent className="flex-1 py-8">
                    {currentStep === "personal" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold">Personal Details</h2>
                                <p className="text-muted-foreground text-sm">
                                    Let's start with some basic information to personalise your experience.
                                </p>
                            </div>
                            <div className="grid gap-4">
                                <div className="p-4 border rounded-lg bg-muted/30">
                                    <p className="text-sm">Verified Email: <span className="font-medium">{user.email}</span></p>
                                </div>
                                {/* Real form elements would go here */}
                                <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md border border-yellow-100">
                                    Note: In this preview, we are focusing on the wizard flow structure.
                                </p>
                            </div>
                        </div>
                    )}

                    {currentStep === "identity" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold">Identity Verification</h2>
                                <p className="text-muted-foreground text-sm">
                                    Certain features require identity verification to ensure community safety.
                                </p>
                            </div>
                            <div className="grid gap-4">
                                <div className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center gap-4 text-center py-12">
                                    <Shield className="h-12 w-12 text-muted-foreground opacity-50" />
                                    <p className="text-sm text-muted-foreground">Upload identification or connect a verified service.</p>
                                    <Button variant="secondary" size="sm">Connect Australian ID</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === "preferences" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold">Preferred Experience</h2>
                                <p className="text-muted-foreground text-sm">
                                    How should we notify you about community events?
                                </p>
                            </div>
                            <div className="grid gap-4" role="radiogroup" aria-label="Notification Preferences">
                                <Button
                                    variant="outline"
                                    className={cn("justify-start h-auto py-4 px-6 border-2", /* Add state logic if shared state exists */)}
                                    role="radio"
                                    aria-checked="true" // Placeholder for actual state
                                >
                                    <Bell className="mr-4 h-6 w-6 text-primary" />
                                    <div className="text-left">
                                        <p className="font-semibold text-base">Standard Notifications</p>
                                        <p className="text-sm text-muted-foreground">Receive updates via email and push.</p>
                                    </div>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="justify-start h-auto py-4 px-6"
                                    role="radio"
                                    aria-checked="false" // Placeholder for actual state
                                >
                                    <Shield className="mr-4 h-6 w-6 text-muted-foreground" />
                                    <div className="text-left">
                                        <p className="font-semibold text-base">Privacy Focused</p>
                                        <p className="text-sm text-muted-foreground">Minimal notifications, only critical alerts.</p>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    )}

                    {currentStep === "account" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold">Account Type</h2>
                                <p className="text-muted-foreground text-sm">
                                    Utilise the platform as an individual or part of an organisation.
                                </p>
                            </div>
                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Button variant="outline" className="flex-col h-auto py-8 gap-4 border-2 border-primary bg-primary/5">
                                        <User className="h-10 w-10" />
                                        <span className="font-semibold text-lg">Individual</span>
                                    </Button>
                                    <Button variant="outline" className="flex-col h-auto py-8 gap-4">
                                        <Building2 className="h-10 w-10" />
                                        <span className="font-semibold text-lg">Organisation</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === "done" && (
                        <div className="space-y-6 text-center py-12 animate-in zoom-in-95 duration-500">
                            <div className="flex justify-center">
                                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold">All Set!</h2>
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                    Your profile is now complete and your account is fully verified.
                                </p>
                            </div>
                            <Button onClick={handleFinish} size="lg" className="px-8 gap-2">
                                Finish & Go to Dashboard
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>

                {currentStep !== "done" && (
                    <div className="p-6 border-t bg-muted/20 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={currentStep === "personal"}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <Button onClick={handleNext} className="gap-2">
                            Next Step
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}
