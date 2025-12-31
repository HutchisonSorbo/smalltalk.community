"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface IntentSelectionProps {
    onNext: () => void;
}

const INTENTS = [
    { id: "find_band", label: "Find a Band", description: "I'm looking to join a group." },
    { id: "find_musicians", label: "Find Musicians", description: "I'm looking for people to play with." },
    { id: "promote_music", label: "Promote My Music", description: "I want to share my work." },
    { id: "find_gigs", label: "Find Gigs", description: "I want to book shows." },
    { id: "network", label: "Network", description: "I want to meet industry professionals." },
    { id: "learn", label: "Learn & Improve", description: "I want to find teachers or resources." },
];

export function IntentSelection({ onNext }: IntentSelectionProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit() {
        if (!selected) return;
        setLoading(true);
        try {
            const res = await fetch("/api/onboarding/intent", {
                method: "POST",
                body: JSON.stringify({ primaryIntent: selected, specificGoals: [] }),
                headers: { "Content-Type": "application/json" } // Auth header needed via hook or auto-cookie?
                // Assuming middleware or browser cookie handles it for pure client fetch if same origin,
                // BUT our API specifically checks 'Authorization' header in previous steps.
                // I need to ensure the Authorization header is sent in all these components.
            });

            if (!res.ok) throw new Error("Failed to save intent");
            onNext();
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INTENTS.map((intent) => (
                    <Card
                        key={intent.id}
                        className={cn(
                            "cursor-pointer transition-all hover:border-primary",
                            selected === intent.id ? "border-primary bg-primary/5 ring-2 ring-primary" : ""
                        )}
                        onClick={() => setSelected(intent.id)}
                    >
                        <CardContent className="p-4">
                            <div className="font-semibold">{intent.label}</div>
                            <div className="text-sm text-muted-foreground">{intent.description}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Button onClick={handleSubmit} disabled={!selected || loading} className="w-full">
                {loading ? "Saving..." : "Continue"}
            </Button>
        </div>
    );
}
