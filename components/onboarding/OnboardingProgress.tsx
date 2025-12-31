import { Progress } from "@/components/ui/progress";

interface OnboardingProgressProps {
    currentStep: number;
    totalSteps: number;
    label?: string;
}

export function OnboardingProgress({ currentStep, totalSteps, label }: OnboardingProgressProps) {
    const percentage = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

    return (
        <div className="w-full space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>{label || `Step ${currentStep} of ${totalSteps}`}</span>
                <span>{Math.round(percentage)}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
        </div>
    );
}
