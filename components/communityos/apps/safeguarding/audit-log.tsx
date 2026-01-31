"use client";

import React from "react";
import { COSCard } from "@/components/communityos/ui/cos-card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Clock, FileText, CheckCircle2, History, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditLogEntry {
    id: string;
    user_name: string;
    action: string;
    target_type: "standard" | "evidence" | "incident" | "risk-assessment";
    target_id: string;
    details?: string;
    created_at: string;
}

interface AuditLogViewProps {
    logs: AuditLogEntry[];
}

export function AuditLogView({ logs }: AuditLogViewProps) {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Compliance Audit Trail
                </h3>
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground">
                    {logs.length} Entries
                </Badge>
            </div>

            <COSCard variant="default" className="p-0 overflow-hidden">
                <ScrollArea className="h-[400px]">
                    <div className="divide-y divide-border">
                        {logs.length > 0 ? (
                            logs.map((log) => (
                                <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors flex items-start gap-4">
                                    <div className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                        log.target_type === 'standard' ? "bg-blue-100 text-blue-600" :
                                            log.target_type === 'evidence' ? "bg-green-100 text-green-600" :
                                                log.target_type === 'incident' ? "bg-red-100 text-red-600" :
                                                    "bg-orange-100 text-orange-600"
                                    )}>
                                        <TargetIcon type={log.target_type} />
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs" title={log.action}>
                                                {log.action}
                                            </p>
                                            <time className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(log.created_at).toLocaleString('en-AU', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </time>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1 overflow-hidden">
                                                <User className="h-3 w-3 shrink-0" />
                                                <span className="truncate max-w-[120px]" title={log.user_name}>
                                                    {log.user_name}
                                                </span>
                                            </div>
                                            <span>•</span>
                                            <span className="capitalize">{log.target_type.replace('-', ' ')}</span>
                                        </div>

                                        {log.details && (
                                            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md mt-2 border border-border/50">
                                                {log.details}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                                <History className="h-8 w-8 opacity-20" />
                                <p className="text-sm font-medium">No activity recorded yet.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </COSCard>
        </div>
    );
}

function TargetIcon({ type }: { type: AuditLogEntry["target_type"] }) {
    switch (type) {
        case "standard":
            return <CheckCircle2 className="h-4 w-4" />;
        case "evidence":
            return <FileText className="h-4 w-4" />;
        case "incident":
            return <AlertCircle className="h-4 w-4" />;
        case "risk-assessment":
            return <History className="h-4 w-4" />; // Or dynamic
    }
}

