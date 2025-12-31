"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Users, ExternalLink, MonitorPlay } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { safeUrl } from "@/lib/utils";

interface DiscordMember {
    id: string;
    username: string;
    status: string;
    avatar_url: string;
}

interface DiscordWidgetData {
    id: string;
    name: string;
    instant_invite: string | null;
    members: DiscordMember[];
    presence_count: number;
}

const SERVER_ID = "1448543778880360540";
const WIDGET_API_URL = `https://discordapp.com/api/guilds/${SERVER_ID}/widget.json`;

export function DiscordWidget() {
    const [data, setData] = useState<DiscordWidgetData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(WIDGET_API_URL);
                if (response.status === 403 || response.status === 50004) {
                    throw new Error("Widget is disabled for this server.");
                }
                if (!response.ok) {
                    throw new Error("Failed to fetch Discord widget data.");
                }
                const jsonData = await response.json();
                if (jsonData.code === 50004) {
                    throw new Error("Widget is disabled for this server.");
                }
                setData(jsonData);
            } catch (err: any) {
                setError(err.message || "An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Card className="max-w-6xl w-full mx-auto h-[250px]">
                <CardContent className="p-6 h-full flex items-center justify-center">
                    <div className="space-y-4 w-full">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="max-w-6xl w-full mx-auto border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground min-h-[200px]">
                    <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
                    <p className="mb-4">Join our Discord Community</p>
                    <p className="text-xs text-red-400 mb-4">{error}</p>
                    <p className="text-xs">Please enable the Server Widget in Discord Server Settings.</p>
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    const inviteCode = data.instant_invite ? data.instant_invite.split('/').pop() : "";
    // Ensure code is alphanumeric to prevent injection, though discord:// protocol is specific
    const safeInviteCode = inviteCode?.replace(/[^a-zA-Z0-9]/g, '');
    // Explicitly construct string with known protocol, ensuring only alphanumeric characters are used
    const appLaunchUrl = safeInviteCode && safeInviteCode.length > 0 ? `discord://invite/${safeInviteCode}` : "#";

    return (
        <Card className="max-w-6xl w-full mx-auto hover-elevate overflow-hidden border-l-4 border-l-[#5865F2] shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 h-full min-h-[180px]">
                {/* LEFT: Branding & Actions */}
                <div className="p-6 md:p-8 flex flex-col justify-between bg-gradient-to-br from-[#5865F2]/5 via-background to-background">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 bg-[#5865F2] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#5865F2]/20">
                                <MessageSquare className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-2xl leading-none tracking-tight">{data.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="border-[#5865F2]/30 text-[#5865F2] bg-[#5865F2]/5 hover:bg-[#5865F2]/10 gap-1.5 px-2 py-0.5">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                        {data.presence_count} Online
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col items-center text-center">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3 max-w-sm">
                            Connect with local musicians, find bandmates, and organise gigs in real time.
                        </h4>

                        <Button variant="outline" size="sm" className="h-7 border-[#5865F2]/50 text-[#5865F2] hover:bg-[#5865F2]/10 font-bold text-[10px] uppercase tracking-widest mb-3" asChild>
                            <a href={safeUrl(data.instant_invite) || `https://discord.com/channels/${SERVER_ID}`} target="_blank" rel="noopener noreferrer">
                                Connect to Server
                            </a>
                        </Button>

                        <div className="flex flex-wrap gap-3 justify-center">
                            {data.instant_invite && (
                                <>
                                    <Button size="lg" className="bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-md transition-all hover:scale-105" asChild>
                                        <a href={appLaunchUrl} aria-label="Open in Discord App">
                                            <MonitorPlay className="mr-2 h-5 w-5" />
                                            Launch App
                                        </a>
                                    </Button>
                                    <Button size="lg" variant="secondary" className="bg-background border shadow-sm hover:bg-accent" asChild>
                                        <a href={safeUrl(data.instant_invite)} target="_blank" rel="noopener noreferrer">
                                            Join Server
                                            <ExternalLink className="ml-2 h-4 w-4" />
                                        </a>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Members List */}
                <div className="p-6 md:p-8 bg-muted/30 border-t md:border-t-0 md:border-l flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>Online Members</span>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 h-[100px] pr-4 -mr-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                            {data.members.map((member) => (
                                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg bg-background/50 hover:bg-background border border-transparent hover:border-border transition-all duration-200">
                                    <div className="relative shrink-0">
                                        <Avatar className="h-8 w-8 border border-border shadow-sm">
                                            <AvatarImage src={member.avatar_url} />
                                            <AvatarFallback>{member.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${member.status === 'online' ? 'bg-green-500' :
                                            member.status === 'idle' ? 'bg-yellow-500' :
                                                member.status === 'dnd' ? 'bg-red-500' : 'bg-gray-500'
                                            }`} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-semibold leading-none truncate">{member.username}</span>
                                        <span className="text-[10px] text-muted-foreground capitalize mt-0.5">{member.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </Card>
    );
}

// CodeRabbit Audit Trigger
