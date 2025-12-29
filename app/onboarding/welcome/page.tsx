"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LayoutGrid } from "lucide-react";
import Link from "next/link";

export default function WelcomePage() {
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        // Mark onboarding as complete in background
        fetch("/api/user/complete-onboarding", { method: "POST" })
            .then(() => setIsComplete(true))
            .catch(console.error);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="rounded-full bg-green-100 p-6 text-green-600 mb-4">
                <CheckCircle2 className="h-16 w-16" />
            </div>

            <h1 className="text-4xl font-bold tracking-tight">You're all set!</h1>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
                Your profile has been created and your apps are ready. Welcome to smalltalk.community.
            </p>

            <div className="pt-8">
                <Button size="lg" className="h-12 px-8 text-lg gap-2" asChild>
                    <Link href="/dashboard">
                        <LayoutGrid className="h-5 w-5" />
                        Go to Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    );
}
