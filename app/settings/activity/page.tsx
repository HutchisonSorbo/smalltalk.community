import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Separator } from "@/components/ui/separator";
import { LogIn, Key, Shield, User, Globe, MousePointer2 } from "lucide-react";

export default async function ActivitySettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?next=/settings/activity");
    }

    // Fetch recent activity
    const { data: logs } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

    const getEventIcon = (type: string) => {
        if (type.includes("login")) return LogIn;
        if (type.includes("password")) return Key;
        if (type.includes("mfa")) return Shield;
        if (type.includes("profile")) return User;
        return MousePointer2;
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Activity Log</h3>
                <p className="text-sm text-muted-foreground">
                    Recent security events and actions performed on your account.
                </p>
            </div>
            <Separator />

            <div className="space-y-4">
                {!logs || logs.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <Globe className="h-10 w-10 text-muted-foreground opacity-20 mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">No recent activity found.</p>
                    </div>
                ) : (
                    <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:to-transparent">
                        {logs.map((log) => {
                            const Icon = getEventIcon(log.eventType);
                            return (
                                <div key={log.id} className="relative flex items-start gap-4 pl-10 animate-in fade-in slide-in-from-left-4">
                                    <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-background border-2 border-primary/20 shadow-sm">
                                        <Icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1 py-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold capitalize">{log.eventType.replace(/_/g, " ")}</p>
                                            <time className="text-[10px] text-muted-foreground font-medium uppercase">
                                                {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </time>
                                        </div>
                                        <p className="text-sm text-muted-foreground italic">
                                            {log.description}
                                        </p>
                                        {log.ipAddress && (
                                            <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                                                IP: {log.ipAddress} • {log.userAgent?.split(' ')[0] || 'Unknown Browser'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
