"use client";

import React from "react";
import { COSCard } from "@/components/communityos/ui/cos-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, User, AlertCircle, CheckCircle2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Credential {
    id: string;
    user_name: string;
    type: string; // e.g., "WWCC", "Police Check", "First Aid"
    expiry_date: string;
    status: "valid" | "expiring-soon" | "expired";
}

interface ExpiryTrackerProps {
    credentials: Credential[];
}

export function ExpiryTracker({ credentials }: ExpiryTrackerProps) {
    const expiringCount = credentials.filter(c => c.status === 'expiring-soon').length;
    const expiredCount = credentials.filter(c => c.status === 'expired').length;

    return (
        <div className="space-y-4 animate-in fade-in duration-500 max-w-full">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Credential Expiry Tracker
                </h3>
                <div className="flex gap-2">
                    {expiredCount > 0 && (
                        <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                            {expiredCount} Expired
                        </Badge>
                    )}
                    {expiringCount > 0 && (
                        <Badge variant="outline" className="text-[10px] uppercase font-bold border-orange-200 text-orange-600 bg-orange-50">
                            {expiringCount} Alerts
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {credentials.length > 0 ? (
                    credentials.map((cred) => (
                        <CredentialCard key={cred.id} cred={cred} />
                    ))
                ) : (
                    <EmptyState />
                )}
            </div>
        </div>
    );
}

function CredentialCard({ cred }: { cred: Credential }) {
    return (
        <COSCard
            variant="default"
            className={cn(
                "p-4 border-l-4",
                cred.status === 'expired' ? "border-l-destructive bg-destructive/5" :
                    cred.status === 'expiring-soon' ? "border-l-orange-500 bg-orange-50/50" :
                        "border-l-green-500"
            )}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                    <div className="text-sm font-bold flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-semibold truncate max-w-[120px] sm:max-w-[180px]" title={cred.user_name}>
                            {cred.user_name}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[150px]" title={cred.type}>
                        {cred.type}
                    </p>
                </div>
                <StatusBadge status={cred.status} />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-medium uppercase text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Expiry: {new Date(cred.expiry_date).toLocaleDateString('en-AU')}
                    </span>
                    <span>{getDaysRemaining(cred.expiry_date)} days left</span>
                </div>
                <Progress
                    value={calculateProgress(cred.expiry_date)}
                    className={cn(
                        "h-1.5",
                        cred.status === 'expired' ? "bg-destructive/20" :
                            cred.status === 'expiring-soon' ? "bg-orange-200" :
                                "bg-green-200"
                    )}
                />
            </div>
        </COSCard>
    );
}

function EmptyState() {
    return (
        <div className="md:col-span-2 p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl border-border/50">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm font-medium">All credentials are up to date.</p>
        </div>
    );
}

function StatusBadge({ status }: { status: Credential["status"] }) {
    const configs = {
        valid: { label: "Valid", icon: CheckCircle2, className: "text-green-600 bg-green-50" },
        "expiring-soon": { label: "Expiring soon", icon: AlertCircle, className: "text-orange-600 bg-orange-50" },
        expired: { label: "Expired", icon: AlertCircle, className: "text-destructive bg-destructive/10" },
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
        <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase", config.className)}>
            <Icon className="h-3 w-3" />
            {config.label}
        </div>
    );
}

function getDaysRemaining(expiryDate: string): number {
    const days = Math.ceil(
        (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, days);
}

function calculateProgress(expiryDate: string): number {
    const days = getDaysRemaining(expiryDate);
    if (days <= 0) return 0;
    if (days >= 90) return 100;
    return (days / 90) * 100;
}
