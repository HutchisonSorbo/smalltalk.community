"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/vic-band/Header";
import { Footer } from "@/components/vic-band/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, Info, Mail, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: notifications, isLoading } = useQuery<Notification[]>({
        queryKey: ["/api/notifications"],
        enabled: isAuthenticated,
    });

    const markReadMutation = useMutation({
        mutationFn: async (id: string) => {
            await fetch(`/api/notifications/${id}/read`, { method: "POST" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
            queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
        },
    });

    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            await fetch("/api/notifications/mark-all-read", { method: "POST" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
            queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
        },
    });

    if (authLoading) return null;
    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markReadMutation.mutate(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'message': return <Mail className="h-5 w-5 text-blue-500" />;
            case 'invite': return <Calendar className="h-5 w-5 text-green-500" />;
            default: return <Info className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Bell className="h-8 w-8" />
                        Notifications
                    </h1>
                    {notifications && notifications.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAllReadMutation.mutate()}
                            disabled={markAllReadMutation.isPending}
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                    </div>
                ) : notifications?.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <Bell className="h-12 w-12 mb-4 opacity-20" />
                            <p>You have no notifications.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {notifications?.map(notification => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "p-4 rounded-lg border transition-colors cursor-pointer hover:bg-accent/5 flex gap-4",
                                    notification.isRead ? "bg-card opacity-70" : "bg-card border-primary/20 shadow-sm"
                                )}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                    notification.isRead ? "bg-muted" : "bg-primary/10"
                                )}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className={cn("font-medium", !notification.isRead && "font-semibold")}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                            {formatDistanceToNow(new Date(notification.createdAt!), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {notification.message}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                                )}


                                {/* Action Area for Contact Requests */}
                                {
                                    notification.type === 'contact_request' && !notification.isRead && (notification.metadata as any) && (
                                        <div className="ml-14 mt-[-10px] mb-4 flex gap-2">
                                            <RequestActionButtons
                                                requestId={(notification.metadata as any).requestId}
                                                notificationId={notification.id}
                                            />
                                        </div>
                                    )
                                }
                            </div>
                        ))}
                    </div>
                )
                }
            </main >
            <Footer />
        </div >
    );
}

function RequestActionButtons({ requestId, notificationId }: { requestId: string, notificationId: string }) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const respondMutation = useMutation({
        mutationFn: async (status: 'accepted' | 'declined') => {
            const res = await fetch(`/api/contact-requests/${requestId}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error("Failed to respond");

            // Should also mark notification as read
            await fetch(`/api/notifications/${notificationId}/read`, { method: "POST" });
        },
        onSuccess: () => {
            toast({ title: "Response sent" });
            queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
            queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
        },
        onError: () => {
            toast({ title: "Error sending response", variant: "destructive" });
        }
    });

    return (
        <>
            <Button
                size="sm"
                className="h-8 bg-green-600 hover:bg-green-700 text-white"
                onClick={(e) => { e.stopPropagation(); respondMutation.mutate('accepted'); }}
                disabled={respondMutation.isPending}
            >
                Accept
            </Button>
            <Button
                size="sm"
                variant="outline"
                className="h-8 text-destructive hover:text-white hover:bg-destructive"
                onClick={(e) => { e.stopPropagation(); respondMutation.mutate('declined'); }}
                disabled={respondMutation.isPending}
            >
                Decline
            </Button>
        </>
    );
}
