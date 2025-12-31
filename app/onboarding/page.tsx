"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { ProfileSetup } from "@/components/onboarding/ProfileSetup";
import { IntentSelection } from "@/components/onboarding/IntentSelection";
import { AppRecommendations } from "@/components/onboarding/AppRecommendations";
import { PrivacyPreferences } from "@/components/onboarding/PrivacyPreferences";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        try {
            const res = await fetch("/api/onboarding/status");
            if (res.ok) {
                const data = await res.json();
                if (data.onboardingCompleted) {
                    router.replace("/dashboard");
                    return;
                }
                // Map step to UI
                // 0 = Just registered -> Step 1: Profile
                // 2 = Profile done -> Step 2: Intent (DB says 2)
                // 3 = Intent done -> Step 3: Apps
                // 4 = Apps done -> Step 4: Privacy
                // 5 = Privacy done -> Complete

                // Adjust DB step to UI step (1-based)
                // DB: 0 or 1 => Profile (UI Step 1)
                // DB: 2 => Intent (UI Step 2)
                // DB: 3 => Apps (UI Step 3)
                // DB: 4 => Privacy (UI Step 4)
                // DB: 5+ => Dashboard

                let current = 1;
                if (data.onboardingStep >= 2) current = 2;
                if (data.onboardingStep >= 3) current = 3;
                if (data.onboardingStep >= 4) current = 4;
                if (data.onboardingStep >= 5) {
                    router.replace("/dashboard");
                    return;
                }

                setStep(current);
            } else {
                // Auth error or other, maybe redirect login
                // router.push("/login"); // Optional
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleNext = () => {
        // Refresh status to get next step from DB
        // Or optimistically increment
        setLoading(true);
        fetchStatus();
    };

    if (loading || step === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const steps = [
        { id: 1, title: "Tell us about yourself", description: "Let's build your profile." },
        { id: 2, title: "What brings you here?", description: "Help us tailor your experience." },
        { id: 3, title: "Recommended Apps", description: "Choose apps to add to your dashboard." },
        { id: 4, title: "Privacy & Notifications", description: "You're in control." },
    ];

    const currentStepInfo = steps.find(s => s.id === step) || steps[0];

    return (
        <OnboardingLayout
            currentStep={step}
            totalSteps={4}
            title={currentStepInfo.title}
            description={currentStepInfo.description}
        >
            {step === 1 && <ProfileSetup onNext={handleNext} />}
            {step === 2 && <IntentSelection onNext={handleNext} />}
            {step === 3 && <AppRecommendations onNext={handleNext} />}
            {step === 4 && <PrivacyPreferences onNext={handleNext} />}
        </OnboardingLayout>
    );
}
