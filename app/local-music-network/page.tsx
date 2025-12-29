"use client";

import { useAuth } from "@/hooks/useAuth";
import Landing from "@/components/local-music-network/pages/Landing";
import Home from "@/components/local-music-network/pages/Home";
import { Loader2 } from "lucide-react";

export default function Page() {
    const { isAuthenticated, isLoading } = useAuth();

    /*
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }
    */

    if (!isAuthenticated) {
        return <Landing />;
    }

    return <Home />;
}

// CodeRabbit Audit Trigger
