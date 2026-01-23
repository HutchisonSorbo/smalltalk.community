"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { logoutOtherSessions } from "../actions";

export function SessionsManager() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogoutOthers = async () => {
        setIsLoading(true);
        try {
            const result = await logoutOtherSessions();
            if (result.success) {
                toast({
                    title: "Sessions updated",
                    description: "You have been logged out from all other devices.",
                });
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to logout other sessions.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("[SessionsManager] Logout others failed:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred while logging out of other devices.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
                <div className="space-y-0.5">
                    <p className="font-medium">Current Session</p>
                    <p className="text-muted-foreground">This device</p>
                </div>
                <span className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Active
                </span>
            </div>
            <Button
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full justify-start px-0"
                onClick={handleLogoutOthers}
                disabled={isLoading}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign out of all other sessions
            </Button>
        </div>
    );
}
