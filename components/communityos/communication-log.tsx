"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CommLog {
    id: string;
    type: string;
    subject: string;
    status: "Draft" | "Sent";
    date: string;
}

interface CommunicationLogProps {
    logs: CommLog[];
}

export function CommunicationLog({ logs }: CommunicationLogProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Communication History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {logs.map((log) => (
                        <div key={log.id} data-testid="log-item" className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <p className="font-medium">{log.subject}</p>
                                <p className="text-sm text-muted-foreground">{log.type} • {log.date}</p>
                            </div>
                            <Badge variant={log.status === "Sent" ? "default" : "secondary"}>
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
