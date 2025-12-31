"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
// import { type App } from "@/shared/schema"; // Can't import from shared/schema in client component often if it has node deps, but types should be fine.

interface RecommendedApp {
    app: {
        id: string;
        name: string;
        description: string;
        iconUrl: string;
        category?: string;
    };
    score: number;
}

interface AppRecommendationsProps {
    onNext: () => void;
}

export function AppRecommendations({ onNext }: AppRecommendationsProps) {
    const [recommendations, setRecommendations] = useState<RecommendedApp[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Fetch recommendations
        // Need auth token handling
        fetch("/api/onboarding/recommendations")
            .then(res => res.json())
            .then(data => {
                if (data.recommendations) {
                    setRecommendations(data.recommendations);
                    // Default select high scoring ones?
                    const initial = new Set<string>();
                    data.recommendations.forEach((r: RecommendedApp) => {
                        if (r.score > 30) initial.add(r.app.id);
                    });
                    setSelectedIds(initial);
                }
                setLoading(false);
            })
            .catch(e => {
                console.error(e);
                setLoading(false);
            });
    }, []);

    const toggleApp = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    async function handleSubmit() {
        setSubmitting(true);
        try {
            await fetch("/api/onboarding/select-apps", {
                method: "POST",
                body: JSON.stringify({ selectedAppIds: Array.from(selectedIds) }),
                headers: { "Content-Type": "application/json" }
            });
            onNext();
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div>Loading recommendations...</div>;

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {recommendations.map((rec) => (
                    <Card key={rec.app.id} className="flex items-center p-4 justify-between">
                        <div className="flex items-center gap-4">
                            {/* <img src={rec.app.iconUrl} className="w-10 h-10 rounded" />  Warning on simple img tag? Use Next Image if possible */}
                            <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center text-xl">📱</div>
                            <div>
                                <div className="font-semibold">{rec.app.name}</div>
                                <div className="text-sm text-muted-foreground">{rec.app.description}</div>
                                {/* <div className="text-xs text-green-600">Match: {rec.score}%</div> */}
                            </div>
                        </div>
                        <Switch
                            checked={selectedIds.has(rec.app.id)}
                            onCheckedChange={() => toggleApp(rec.app.id)}
                        />
                    </Card>
                ))}
            </div>

            {recommendations.length === 0 && (
                <div className="text-center text-muted-foreground">No specific recommendations found. You can add apps later from the catalogue.</div>
            )}

            <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting ? "Saving..." : "Continue"}
            </Button>
        </div>
    );
}
