"use client";

import * as React from "react";
import { CRMContactCard } from "./crm-contact-card";
import { COSSwipeable } from "../ui/cos-swipeable";
import { Phone, Mail } from "lucide-react";
import type { CrmContactCardProps } from "@/types/crm";
import { safeUrl } from "@/lib/utils";

/**
 * Wrapper for CRMContactCard with swipe-to-action gestures on mobile.
 * Swipe right to call, swipe left to email.
 */
export function CRMSwipeableContactCard({ contact, onClick, className, isSelected, onToggleSelection }: CrmContactCardProps) {
    const handleCall = () => {
        if (contact.phone) {
            const url = safeUrl(`tel:${contact.phone}`);
            if (url) window.location.href = url;
        }
    };

    const handleEmail = () => {
        if (contact.email) {
            const url = safeUrl(`mailto:${contact.email}`);
            if (url) window.location.href = url;
        }
    };

    return (
        <COSSwipeable
            leftAction={contact.phone ? {
                icon: <Phone className="h-5 w-5 text-white" />,
                color: "bg-green-500",
                onClick: handleCall,
            } : undefined}
            rightAction={contact.email ? {
                icon: <Mail className="h-5 w-5 text-white" />,
                color: "bg-blue-500",
                onClick: handleEmail,
            } : undefined}
            className={className}
        >
            <CRMContactCard
                contact={contact}
                onClick={onClick}
                isSelected={isSelected}
                onToggleSelection={onToggleSelection}
            />
        </COSSwipeable>
    );
}
