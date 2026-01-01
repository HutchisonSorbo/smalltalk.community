"use client";

import React, { useState, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Plus, ExternalLink, MoreVertical, Trash2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

export interface AppData {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    route: string;
    category?: string;
    isBeta?: boolean;
}

interface AppCardProps {
    app: AppData;
    variant: "onboarding" | "dashboard" | "showcase" | "catalogue";
    isSelected?: boolean;
    onToggle?: (appId: string) => void;
    onRemove?: (appId: string) => void;
    onAdd?: (appId: string) => void;
}

function AppCardComponent({
    app,
    variant,
    isSelected = false,
    onToggle,
    onRemove,
    onAdd
}: AppCardProps) {
    const [detailsOpen, setDetailsOpen] = useState(false);

    // ONBOARDING VARIANT
    if (variant === "onboarding") {
        return (
            <div
                onClick={() => onToggle?.(app.id)}
                className={cn(
                    "relative group flex flex-col p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden",
                    isSelected
                        ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                        : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
                )}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onToggle?.(app.id);
                    }
                }}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-muted flex items-center justify-center shrink-0">
                        {/* Placeholder for real image implementation */}
                        {app.iconUrl.startsWith('/') ? (
                            <Image src={app.iconUrl} alt={app.name} fill className="object-cover" />
                        ) : (
                            <span className="text-2xl font-bold text-muted-foreground">{app.name[0]}</span>
                        )}
                    </div>
                    <div className={cn(
                        "h-6 w-6 rounded border transition-colors flex items-center justify-center",
                        isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground group-hover:border-primary"
                    )}>
                        {isSelected && <Check className="h-4 w-4" />}
                    </div>
                </div>

                <h3 className="font-bold text-lg mb-1">{app.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{app.description}</p>

                {app.isBeta && (
                    <Badge variant="secondary" className="absolute top-4 right-12 opacity-80">Beta</Badge>
                )}
            </div>
        );
    }

    // DASHBOARD VARIANT
    if (variant === "dashboard") {
        return (
            <div className="group flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                <div className="flex justify-between items-start mb-6">
                    <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-muted shadow-sm flex items-center justify-center">
                        {app.iconUrl.startsWith('/') ? (
                            <Image src={app.iconUrl} alt={app.name} fill className="object-cover" />
                        ) : (
                            <span className="text-4xl font-bold text-muted-foreground">{app.name[0]}</span>
                        )}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={app.route} target="_blank">
                                    <ExternalLink className="mr-2 h-4 w-4" /> Open in new tab
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove?.(app.id);
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Remove
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <h3 className="font-bold text-xl mb-2">{app.name}</h3>

                <div className="mt-auto pt-4">
                    <Button asChild className="w-full font-semibold" size="lg">
                        <Link href={app.route}>Open App</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // SHOWCASE & CATALOGUE VARIANTS
    return (
        <div className="flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md h-full">
            <div className="flex justify-between items-start mb-4">
                <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-muted flex items-center justify-center shrink-0">
                    {app.iconUrl.startsWith('/') ? (
                        <Image src={app.iconUrl} alt={app.name} fill className="object-cover" />
                    ) : (
                        <span className="text-2xl font-bold text-muted-foreground">{app.name[0]}</span>
                    )}
                </div>
                {variant === "showcase" && (
                    <Badge variant="outline" className="bg-background/50">Sign up to access</Badge>
                )}
                {variant === "catalogue" && onAdd && (
                    <Button onClick={() => onAdd(app.id)} size="sm" className="gap-1">
                        <Plus className="h-4 w-4" /> Add
                    </Button>
                )}
                {variant === "catalogue" && onRemove && (
                    <Button onClick={() => onRemove(app.id)} size="sm" variant="outline" className="gap-1 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" /> Remove
                    </Button>
                )}
            </div>

            <h3 className="font-bold text-lg mb-2">{app.name}</h3>
            <p className="text-sm text-muted-foreground mb-4 flex-grow">{app.description}</p>

            {variant === "catalogue" && (
                <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground">
                            <Info className="h-3 w-3 mr-1" />
                            {detailsOpen ? "Less info" : "More info"}
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        Features info placeholder...
                    </CollapsibleContent>
                </Collapsible>
            )}
        </div>
    );
}

export const AppCard = memo(AppCardComponent);
