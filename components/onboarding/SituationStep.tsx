"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
    GraduationCap,
    Briefcase,
    Search,
    Coffee,
    HelpCircle,
    ArrowRight
} from "lucide-react";

interface SituationStepProps {
    onNext: () => void;
}

const SITUATIONS = [
    {
        id: "student_school",
        label: "Student at school",
        description: "Currently in high school",
        icon: GraduationCap,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10"
    },
    {
        id: "student_tertiary",
        label: "Student at TAFE or Uni",
        description: "Studying at tertiary level",
        icon: GraduationCap,
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10"
    },
    {
        id: "working",
        label: "Working",
        description: "Employed full-time or part-time",
        icon: Briefcase,
        color: "text-green-500",
        bgColor: "bg-green-500/10"
    },
    {
        id: "looking_for_work",
        label: "Looking for work",
        description: "Seeking employment opportunities",
        icon: Search,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10"
    },
    {
        id: "taking_a_break",
        label: "Taking a break",
        description: "Between studies or work",
        icon: Coffee,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10"
    },
    {
        id: "other",
        label: "Something else",
        description: "None of the above",
        icon: HelpCircle,
        color: "text-gray-500",
        bgColor: "bg-gray-500/10"
    },
];

export function SituationStep({ onNext }: SituationStepProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit() {
        if (!selected) return;
        setLoading(true);
        try {
            const res = await fetch("/api/onboarding/situation", {
                method: "POST",
                body: JSON.stringify({ currentSituation: selected }),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error("Failed to save situation");
            onNext();
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">What best describes you right now?</h2>
                <p className="text-muted-foreground">
                    This helps us recommend relevant opportunities and resources.
                </p>
            </div>

            <div className="grid gap-3">
                {SITUATIONS.map((situation) => {
                    const Icon = situation.icon;
                    const isSelected = selected === situation.id;

                    return (
                        <button
                            key={situation.id}
                            onClick={() => setSelected(situation.id)}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                                isSelected
                                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                            )}
                        >
                            <div className={cn("p-3 rounded-lg", situation.bgColor)}>
                                <Icon className={cn("h-5 w-5", situation.color)} />
                            </div>
                            <div>
                                <div className="font-semibold">{situation.label}</div>
                                <div className="text-sm text-muted-foreground">
                                    {situation.description}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <Button
                onClick={handleSubmit}
                disabled={!selected || loading}
                className="w-full gap-2"
            >
                {loading ? "Saving..." : (
                    <>
                        Continue <ArrowRight className="h-4 w-4" />
                    </>
                )}
            </Button>
        </div>
    );
}
