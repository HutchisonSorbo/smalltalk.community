"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Interface representing a single communication log entry.
 */
export interface CommLog {
    id: string;
    type: string;
    subject: string;
    status: "Draft" | "Sent";
    date: string;
}

/**
 * Props for the CommunicationLog component.
 */
export interface CommunicationLogProps {
    logs: CommLog[];
}

/**
 * CommunicationLog component displays a history of communications.
 * It includes the subject, type, date, and status for each log entry.
 * 
 * @param {CommunicationLogProps} props - The component props.
 * @returns {JSX.Element} The rendered communication log.
 */
export function CommunicationLog({ logs }: CommunicationLogProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Communication History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {logs.map((log) => (
                        <div key={log.id} data-testid="log-item" className="flex items-center justify-between p-3 border rounded-lg overflow-hidden">
                            <div className="min-w-0 flex-1 mr-4">
                                <p className="font-medium truncate" title={log.subject}>{log.subject}</p>
                                <p className="text-sm text-muted-foreground truncate" title={`${log.type} • ${log.date}`}>
                                    {log.type} • {log.date}
                                </p>
                            </div>
                            <Badge variant={log.status === "Sent" ? "default" : "secondary"} className="shrink-0 truncate max-w-[100px]">
                                {log.status}
                            </Badge>
                        </div>
                    ))}
                    {logs.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">No communication logs found.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
