"use client";

import { useQuery } from "@tanstack/react-query";
import { ProfessionalProfileForm } from "@/components/local-music-network/ProfessionalProfileForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";
import type { ProfessionalProfile } from "@shared/schema";

export function ProfessionalDashboardContent({ user }: { user: any }) {
    const { data: myProfile, isLoading } = useQuery<ProfessionalProfile>({
        queryKey: ["professional-profile", user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const res = await fetch(`/local-music-network/api/professionals?userId=${user.id}`);
            if (res.status === 404) return null;
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        },
        enabled: !!user?.id
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {myProfile ? "Edit Professional Profile" : "Create Professional Profile"}
                </CardTitle>
                <CardDescription>
                    {myProfile
                        ? "Update your business information and services"
                        : "List your services in the industry directory to be discovered"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ProfessionalProfileForm
                    profile={myProfile}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ["professional-profile"] });
                        queryClient.invalidateQueries({ queryKey: ["/local-music-network/api/professionals"] });
                    }}
                />
            </CardContent>
        </Card>
    );
}

// CodeRabbit Audit Trigger
