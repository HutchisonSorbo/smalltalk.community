"use client";

import { AuthCodeHandler } from "@/components/auth/AuthCodeHandler";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <AuthCodeHandler />
        </Suspense>
    );
}
