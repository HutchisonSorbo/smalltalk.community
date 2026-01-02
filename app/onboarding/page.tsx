"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { ProfileSetup } from "@/components/onboarding/ProfileSetup";
import { IntentSelection } from "@/components/onboarding/IntentSelection";
import { InterestsSelection } from "@/components/onboarding/InterestsSelection";
import { SituationStep } from "@/components/onboarding/SituationStep";
import { AppRecommendations } from "@/components/onboarding/AppRecommendations";
import { PrivacyPreferences } from "@/components/onboarding/PrivacyPreferences";
import { Loader2 } from "lucide-react";

// Step mapping:
// UI Step 1: Welcome (DB step 0)
// UI Step 2: Profile Setup (DB step 1-2)
// UI Step 3: Interests Selection (DB step 3)
// UI Step 4: Current Situation (DB step 4) - Only for individuals
// UI Step 5: App Recommendations (DB step 5)
// UI Step 6: Privacy & Notifications (DB step 6)
// DB step 7+ = Complete

const TOTAL_STEPS = 6;

const STEPS = [
    { id: 1, title: "Welcome", description: "Let's get you started." },
    { id: 2, title: "Tell us about yourself", description: "Let's build your profile." },
    { id: 3, title: "What interests you?", description: "Help us personalize your experience." },
    { id: 4, title: "Your situation", description: "So we can recommend the right resources." },
    { id: 5, title: "Recommended Apps", description: "Apps matched to your interests." },
    { id: 6, title: "Privacy & Notifications", description: "You're in control." },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [userType, setUserType] = useState<string>("individual");

    const fetchStatus = async () => {
        try {
            const res = await fetch("/api/onboarding/status");
            if (res.ok) {
                const data = await res.json();

                if (data.onboardingCompleted) {
                    router.replace("/dashboard");
                    return;
                }

                setUserType(data.userType || "individual");

                // Map DB step to UI step
                // DB:  0    ->  UI: 1 (Welcome)
                // DB:  1-2  ->  UI: 2 (Profile)
                // DB:  3    ->  UI: 3 (Interests)
                // DB:  4    ->  UI: 4 (Situation) - skip for orgs
                // DB:  5    ->  UI: 5 (Apps)
                // DB:  6    ->  UI: 6 (Privacy)
                // DB:  7+   ->  Dashboard

                let current = 1;
                const dbStep = data.onboardingStep || 0;

                if (dbStep >= 7) {
                    router.replace("/dashboard");
                    return;
                } else if (dbStep >= 6) {
                    current = 6;
                } else if (dbStep >= 5) {
                    current = 5;
                } else if (dbStep >= 4) {
                    // For organizations, skip situation step
                    current = data.userType === "organisation" ? 5 : 4;
                } else if (dbStep >= 3) {
                    current = 3;
                } else if (dbStep >= 1) {
                    current = 2;
                } else {
                    current = 1;
                }

                setStep(current);
            } else if (res.status === 401) {
                router.push("/login?next=/onboarding");
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
        setLoading(true);
        fetchStatus();
    };

    // Special handler for welcome step - doesn't need API call
    const handleWelcomeNext = async () => {
        setLoading(true);
        try {
            // Update DB to step 1
            await fetch("/api/onboarding/start", { method: "POST" });
            fetchStatus();
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    if (loading || step === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const currentStepInfo = STEPS.find(s => s.id === step) || STEPS[0];

    // Welcome step has special layout (no progress bar)
    if (step === 1) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <WelcomeStep onNext={handleWelcomeNext} />
            </div>
        );
    }

    return (
        <OnboardingLayout
            currentStep={step}
            totalSteps={TOTAL_STEPS}
            title={currentStepInfo.title}
            description={currentStepInfo.description}
        >
            {step === 2 && <ProfileSetup onNext={handleNext} />}
            {step === 3 && <InterestsSelection onNext={handleNext} />}
            {step === 4 && <SituationStep onNext={handleNext} />}
            {step === 5 && <AppRecommendations onNext={handleNext} />}
            {step === 6 && <PrivacyPreferences onNext={handleNext} />}
        </OnboardingLayout>
    );
}
