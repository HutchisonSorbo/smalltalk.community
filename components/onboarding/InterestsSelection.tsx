"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Check, Music, Briefcase, Heart, Users, ArrowRight } from "lucide-react";

interface InterestsSelectionProps {
    onNext: () => void;
}

const INTEREST_CATEGORIES = [
    {
        id: "music",
        label: "Music",
        icon: Music,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        interests: [
            { id: "music_playing", label: "Playing an instrument" },
            { id: "music_bands", label: "Finding or joining bands" },
            { id: "music_events", label: "Live music & events" },
            { id: "music_recording", label: "Recording & production" },
            { id: "music_gear", label: "Buying/selling gear" },
        ],
    },
    {
        id: "employment",
        label: "Employment & Careers",
        icon: Briefcase,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        interests: [
            { id: "employment_apprenticeships", label: "Apprenticeships" },
            { id: "employment_traineeships", label: "Traineeships" },
            { id: "employment_jobs", label: "Job opportunities" },
            { id: "employment_career_advice", label: "Career advice" },
            { id: "employment_tafe", label: "TAFE & training" },
        ],
    },
    {
        id: "wellbeing",
        label: "Health & Wellbeing",
        icon: Heart,
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
        interests: [
            { id: "wellbeing_mental_health", label: "Mental health support" },
            { id: "wellbeing_peer_support", label: "Peer support groups" },
            { id: "wellbeing_counselling", label: "Counselling services" },
            { id: "wellbeing_crisis", label: "Crisis support info" },
            { id: "wellbeing_general", label: "General wellbeing" },
        ],
    },
    {
        id: "community",
        label: "Community",
        icon: Users,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        interests: [
            { id: "community_volunteering", label: "Volunteering" },
            { id: "community_events", label: "Local events" },
            { id: "community_networking", label: "Networking" },
            { id: "community_clubs", label: "Clubs & groups" },
            { id: "community_mentoring", label: "Mentoring" },
        ],
    },
];

export function InterestsSelection({ onNext }: InterestsSelectionProps) {
    const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const router = useRouter();

    const toggleInterest = (interestId: string) => {
        const next = new Set(selectedInterests);
        if (next.has(interestId)) {
            next.delete(interestId);
        } else {
            next.add(interestId);
        }
        setSelectedInterests(next);
    };

    const toggleCategory = (categoryId: string) => {
        setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    };

    async function handleSubmit() {
        setLoading(true);
        try {
            const res = await fetch("/api/onboarding/interests", {
                method: "POST",
                body: JSON.stringify({ interests: Array.from(selectedInterests) }),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error("Failed to save interests");
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
                <h2 className="text-2xl font-bold">What are you interested in?</h2>
                <p className="text-muted-foreground">
                    Select topics that interest you. We&apos;ll recommend apps based on your choices.
                </p>
            </div>

            <div className="grid gap-4">
                {INTEREST_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    const isExpanded = expandedCategory === category.id;
                    const categoryInterests = category.interests.filter(i =>
                        selectedInterests.has(i.id)
                    );

                    return (
                        <div
                            key={category.id}
                            className="rounded-xl border bg-card overflow-hidden"
                        >
                            <button
                                className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                                onClick={() => toggleCategory(category.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 rounded-lg", category.bgColor)}>
                                        <Icon className={cn("h-5 w-5", category.color)} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">{category.label}</div>
                                        {categoryInterests.length > 0 && (
                                            <div className="text-xs text-muted-foreground">
                                                {categoryInterests.length} selected
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={cn(
                                    "text-muted-foreground transition-transform",
                                    isExpanded && "rotate-180"
                                )}>
                                    ▼
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="px-4 pb-4 grid gap-2 animate-in slide-in-from-top-2 duration-200">
                                    {category.interests.map((interest) => {
                                        const isSelected = selectedInterests.has(interest.id);
                                        return (
                                            <button
                                                key={interest.id}
                                                onClick={() => toggleInterest(interest.id)}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                                                    isSelected
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border hover:border-primary/50"
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                                                    isSelected
                                                        ? "bg-primary border-primary text-primary-foreground"
                                                        : "border-muted-foreground"
                                                )}>
                                                    {isSelected && <Check className="h-3 w-3" />}
                                                </div>
                                                <span className="text-sm">{interest.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-col gap-2 pt-4">
                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full gap-2"
                >
                    {loading ? "Saving..." : (
                        <>
                            Continue <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </Button>
                {selectedInterests.size === 0 && (
                    <p className="text-xs text-center text-muted-foreground">
                        You can skip this step, but selecting interests helps us personalize your experience
                    </p>
                )}
            </div>
        </div>
    );
}
