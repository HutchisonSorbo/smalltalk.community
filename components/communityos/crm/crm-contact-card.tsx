"use client";

import * as React from "react";
import { COSCard } from "../ui/cos-card";
import { COSBadge } from "../ui/cos-badge";
import { Mail, Phone, Calendar, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    type: string | null;
    metadata: any;
    createdAt: Date | null;
}

interface Props {
    contact: Contact;
    onClick?: () => void;
    className?: string;
    isSelected?: boolean;
    onToggleSelection?: (id: string, selected: boolean) => void;
}

export function CRMContactCard({ contact, onClick, className, isSelected, onToggleSelection }: Props) {
    const fullName = `${contact.firstName} ${contact.lastName}`.trim() || "Unnamed Contact";
    const segments = contact.metadata?.segments || [];

    return (
        <COSCard
            variant="default"
            interactive={!!onClick}
            onClick={onClick}
            className={cn(
                "p-4 space-y-3 relative group transition-all duration-200",
                isSelected ? "ring-2 ring-primary bg-primary/5" : "",
                className
            )}
        >
            {onToggleSelection && (
                <div className="absolute top-2 right-2 z-10">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                            e.stopPropagation();
                            onToggleSelection(contact.id, e.target.checked);
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        aria-label={`Select ${fullName}`}
                    />
                </div>
            )}
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="font-bold text-base">{fullName}</h4>
                    <p className="text-xs text-muted-foreground uppercase tracking-tight font-medium">
                        {contact.type || "individual"}
                    </p>
                </div>
                <COSBadge variant={contact.type === "organisation" ? "info" : "default"} size="sm">
                    {contact.type === "organisation" ? "Org" : "Indiv"}
                </COSBadge>
            </div>

            <div className="space-y-2 text-sm">
                {contact.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{contact.email}</span>
                    </div>
                )}
                {contact.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{contact.phone}</span>
                    </div>
                )}
            </div>

            {segments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {segments.map((segment: string) => (
                        <COSBadge key={segment} size="sm" variant="outline" className="bg-muted/30">
                            {segment}
                        </COSBadge>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2 pt-3 border-t text-[10px] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Added {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : "n/a"}</span>
            </div>
        </COSCard>
    );
}
