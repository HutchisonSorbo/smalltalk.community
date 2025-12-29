"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/local-music-network/Header";
import { Footer } from "@/components/local-music-network/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BandProfileForm } from "@/components/local-music-network/BandProfileForm";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreateBandPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            toast({
                title: "Unauthorized",
                description: "Please log in to register a band.",
                variant: "destructive",
            });
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router, toast]);

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8">
                    <Skeleton className="h-10 w-48 mb-8" />
                    <Skeleton className="h-96 w-full max-w-3xl" />
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Register Your Band</CardTitle>
                                <CardDescription>
                                    Create a profile for your band to find gigs and promote your music.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <BandProfileForm
                                    onSuccess={() => router.push("/bands")}
                                    onCancel={() => router.back()}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

// CodeRabbit Audit Trigger
