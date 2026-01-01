"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function AuthCodeHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const code = searchParams.get("code");
        if (code && !isProcessing) {
            handleAuthCode(code);
        }
    }, [searchParams]);

    const handleAuthCode = async (code: string) => {
        setIsProcessing(true);
        const supabase = createClient();

        try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) throw error;

            if (data.session) {
                // Check if user has completed onboarding
                // We can't easily check public.users here without an API call or custom claim, 
                // but we can try to redirect to dashboard and let middleware handle it, 
                // OR we can fetch the user profile.

                // Let's fetch the profile to be sure
                const { data: profile, error: profileError } = await supabase
                    .from("users")
                    .select("onboarding_completed")
                    .eq("id", data.session.user.id)
                    .single();

                if (!profileError && profile) {
                    if (profile.onboarding_completed) {
                        router.push("/dashboard");
                    } else {
                        router.push("/onboarding");
                    }
                } else {
                    // Fallback if profile fetch fails (e.g. RLS issue or first time)
                    router.push("/onboarding");
                }

                toast({
                    title: "Verified!",
                    description: "You have been successfully verified.",
                });
            }
        } catch (error: any) {
            console.error("Auth code exchange error:", error);
            // Only show error if it's not a "code already used" or similar benign error if possible, 
            // but usually we want to know.
            toast({
                title: "Verification Error",
                description: "There was a problem verifying your account. You may already be logged in, or the link expired.",
                variant: "destructive",
            });
            // If failed, maybe redirect to login?
            router.push("/login");
        } finally {
            setIsProcessing(false);
        }
    };

    if (isProcessing) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-lg font-medium">Verifying your account...</p>
                </div>
            </div>
        );
    }

    return null;
}
