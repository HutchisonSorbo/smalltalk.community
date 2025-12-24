"use client";

import { ProfessionalProfileForm } from "@/components/local-music-network/ProfessionalProfileForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/local-music-network/Header";
import { Footer } from "@/components/local-music-network/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";




export default function ProfessionalEditorPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Check for existing profile
    const { data: existingProfile, isLoading: profileLoading } = useQuery({
        queryKey: ["professional-profile", user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const res = await fetch(`/api/professionals?userId=${user.id}`);
            if (res.status === 404) return null;
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        },
        enabled: !!user
    });

    if (authLoading || profileLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user) {
        router.push("/login?redirect=/dashboard/professional");
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>{existingProfile ? "Edit Professional Profile" : "Create Professional Profile"}</CardTitle>
                        <CardDescription>
                            List your services in the industry directory.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProfessionalProfileForm profile={existingProfile} />
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
