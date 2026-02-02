"use client";

import * as React from "react";
import { CRMContactCard } from "./crm-contact-card";
import { COSSwipeActions, SwipeAction } from "../ui/cos-swipe-actions";
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

    const leftActions: SwipeAction[] = contact.phone ? [{
        id: "call",
        label: "Call",
        icon: <Phone className="h-5 w-5 text-white" />,
        color: "success",
        onClick: handleCall,
    }] : [];

    const rightActions: SwipeAction[] = contact.email ? [{
        id: "email",
        label: "Email",
        icon: <Mail className="h-5 w-5 text-white" />,
        color: "primary",
        onClick: handleEmail,
    }] : [];

    return (
        <COSSwipeActions
            leftActions={leftActions}
            rightActions={rightActions}
            className={className}
        >
            <CRMContactCard
                contact={contact}
                onClick={onClick}
                isSelected={isSelected}
                onToggleSelection={onToggleSelection}
            />
        </COSSwipeActions>
    );
}
