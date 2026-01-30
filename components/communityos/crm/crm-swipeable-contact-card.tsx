"use client";

import * as React from "react";
import { CRMContactCard } from "./crm-contact-card";
import { COSSwipeable } from "../ui/cos-swipeable";
import { Phone, Mail } from "lucide-react";
import type { CrmContactCardProps } from "@/types/crm";

/**
 * Wrapper for CRMContactCard with swipe-to-action gestures on mobile.
 * Swipe right to call, swipe left to email.
 */
export function CRMSwipeableContactCard({ contact, onClick, className, isSelected, onToggleSelection }: CrmContactCardProps) {
    const handleCall = () => {
        if (contact.phone) {
            window.location.href = `tel:${contact.phone}`;
        }
    };

    const handleEmail = () => {
        if (contact.email) {
            window.location.href = `mailto:${contact.email}`;
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
