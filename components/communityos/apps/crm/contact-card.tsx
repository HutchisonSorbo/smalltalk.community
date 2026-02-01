"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Mail, MoreHorizontal } from "lucide-react";
import { CRMContact, CRM_STAGES } from "@/lib/communityos/crm/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ContactCardProps {
    contact: CRMContact;
    onClick?: () => void;
    className?: string;
    compact?: boolean;
}

export function ContactCard({ contact, onClick, className, compact = false }: ContactCardProps) {
    const stage = CRM_STAGES.find(s => s.id === contact.status);

    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    return (
        <Card
            className={cn(
                "group relative p-4 hover:shadow-md transition-all cursor-pointer border-l-4",
                className
            )}
            style={{ borderLeftColor: stage?.color ? undefined : 'transparent' }} // Simplified color handling for now
            onClick={onClick}
        >
            <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-lg", stage?.color.split(' ')[0])} />

            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={contact.avatar} alt={`${contact.firstName} ${contact.lastName}`} />
                        <AvatarFallback>{contact.firstName[0]}{contact.lastName[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm truncate pr-2">
                                {contact.firstName} {contact.lastName}
                            </h3>
                            {!compact && (
                                <Badge variant="secondary" className={cn("text-[10px] h-5 px-1.5 font-normal", stage?.color)}>
                                    {stage?.label}
                                </Badge>
                            )}
                        </div>

                        {(contact.role || contact.company) && (
                            <p className="text-xs text-muted-foreground truncate">
                                {contact.role}{contact.role && contact.company && ' at '}{contact.company}
                            </p>
                        )}

                        {!compact && contact.tags && contact.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                                {contact.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground">
                                        {tag}
                                    </span>
                                ))}
                                {contact.tags.length > 2 && (
                                    <span className="text-[10px] text-muted-foreground self-center">+{contact.tags.length - 2}</span>
                                )}
                            </div>
                        )}

                        {!compact && contact.lastContacted && (
                            <p className="text-[10px] text-muted-foreground pt-1">
                                Last contacted {formatDistanceToNow(new Date(contact.lastContacted))} ago
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {!compact && (
                <div className="flex items-center justify-end gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity md:absolute md:top-3 md:right-3 md:mt-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={(e) => handleAction(e, () => window.location.href = `tel:${contact.phone}`)}
                        disabled={!contact.phone}
                        title="Call"
                    >
                        <Phone className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={(e) => handleAction(e, () => window.location.href = `mailto:${contact.email}`)}
                        disabled={!contact.email}
                        title="Email"
                    >
                        <Mail className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )}
        </Card>
    );
}
