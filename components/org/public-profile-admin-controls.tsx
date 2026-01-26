"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { EditProfileForm } from "./edit-profile-form";
import type { PublicTenant } from "@/lib/communityos/tenant-context";

interface PublicProfileAdminControlsProps {
    tenant: PublicTenant;
}

/**
 * Validates if the color string is a valid 6-digit hex code.
 * Falls back to black if invalid.
 */
function isValidHexColor(color: string | null | undefined): boolean {
    if (!color) return false;
    return /^#[0-9A-F]{6}$/i.test(color);
}

export function PublicProfileAdminControls({ tenant }: PublicProfileAdminControlsProps) {
    const [open, setOpen] = useState(false);

    // Sanitize primary color
    const safePrimaryColor = isValidHexColor(tenant.primaryColor) ? tenant.primaryColor! : '#000000';

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <div className="fixed bottom-6 right-6 z-50 print:hidden">
                <SheetTrigger asChild>
                    <Button
                        size="lg"
                        className="rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all text-white border border-white/10"
                        style={{ backgroundColor: safePrimaryColor }}
                        aria-label="Edit Profile"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                    </Button>
                </SheetTrigger>
            </div>

            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Edit Public Profile</SheetTitle>
                    <SheetDescription>
                        Update your organisation's public facing details. Changes will be visible immediately after saving.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6">
                    <EditProfileForm
                        tenant={tenant}
                        onSuccess={() => setOpen(false)}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
