"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface FeatureFlagToggleProps {
    flagId: string;
    isEnabled: boolean;
}

export function FeatureFlagToggle({ flagId, isEnabled }: FeatureFlagToggleProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(isEnabled);

    const handleToggle = async (newValue: boolean) => {
        setLoading(true);
        setChecked(newValue);

        try {
            const response = await fetch(`/api/admin/feature-flags/${flagId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isEnabled: newValue }),
            });

            if (!response.ok) {
                throw new Error("Failed to update");
            }

            toast.success(`Feature ${newValue ? "enabled" : "disabled"}`);
            router.refresh();
        } catch (error) {
            setChecked(!newValue); // Revert on error
            toast.error("Failed to toggle feature flag");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Switch
            checked={checked}
            onCheckedChange={handleToggle}
            disabled={loading}
            aria-label="Toggle feature flag"
        />
    );
}
