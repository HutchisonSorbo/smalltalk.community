"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Search, Info } from "lucide-react";
import { getUserBadges } from "@/app/volunteer-passport/actions/profile-actions";
import { safeUrl } from "@/lib/utils";

/**
 * Moderate user-generated content for display safety.
 */
const moderateContent = (text: string | null | undefined): string => {
    if (!text) return "";
    return text.trim();
};

function BadgesHeader({ searchQuery, setSearchQuery }: { searchQuery: string, setSearchQuery: (val: string) => void }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <CardTitle>Digital Credentials</CardTitle>
                <CardDescription>Badges earned through community participation and skill building.</CardDescription>
            </div>
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <input
                    type="text"
                    className="pl-8 pr-4 py-2 text-xs border rounded-md dark:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Search badges..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search badges"
                />
            </div>
        </div>
    );
}

function EmptyBadgesPlaceholder() {
    return (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <Award className="h-12 w-12 mx-auto text-gray-300 mb-4" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">You haven't earned any digital badges yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Participate in programmes or complete training to earn badges.</p>
        </div>
    );
}

function BadgeCard({ badge, onViewCriteria }: { badge: any, onViewCriteria: (badge: any) => void }) {
    const sanitizedImageUrl = badge.imageUrl ? safeUrl(badge.imageUrl) : null;
    const moderatedName = moderateContent(badge.name);
    const moderatedDescription = moderateContent(badge.description);

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-24 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border-b">
                {sanitizedImageUrl ? (
                    <img src={sanitizedImageUrl} alt={moderatedName} className="h-16 w-16 object-contain" />
                ) : (
                    <Award className="h-12 w-12 text-primary/40" aria-hidden="true" />
                )}
            </div>
            <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold truncate">{moderatedName}</h4>
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-tight">
                        {badge.category || 'Skill'}
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{moderatedDescription}</p>
                <div className="pt-2 flex items-center justify-between text-[10px] text-gray-500">
                    <span>Issued: {new Date(badge.issuedAt).toLocaleDateString()}</span>
                    <button
                        type="button"
                        onClick={() => onViewCriteria(badge)}
                        className="flex items-center gap-1 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        <Info className="h-3 w-3" aria-hidden="true" />
                        View Criteria
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}

function OpenBadgesInfo() {
    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 flex gap-4 items-start">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" aria-hidden="true" />
            <div className="text-xs space-y-1">
                <p className="font-bold text-blue-800 dark:text-blue-300">Open Badges Compatible</p>
                <p className="text-blue-700/80 dark:text-blue-400">These badges are portable and can be shared on LinkedIn or verified by other Open Badges compatible platforms.</p>
            </div>
        </div>
    );
}

export function ProfileBadgesTab({ userId }: { userId: string }) {
    const [badges, setBadges] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const data = await getUserBadges(userId);
                setBadges(data || []);
            } catch (error) {
                console.error(`[ProfileBadgesTab] Failed to load badges for userId: ${userId}`, error);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [userId]);

    const normalisedQuery = searchQuery.trim().slice(0, 100).toLowerCase();
    const filteredBadges = badges.filter((badge) =>
        badge.name?.toLowerCase().includes(normalisedQuery) ||
        badge.description?.toLowerCase().includes(normalisedQuery)
    );

    if (isLoading) return <div className="p-12 text-center animate-pulse" role="status">Loading badges...</div>;

    return (
        <div className="space-y-6 max-w-full">
            <Card>
                <CardHeader>
                    <BadgesHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                </CardHeader>
                <CardContent>
                    {badges.length === 0 ? <EmptyBadgesPlaceholder /> : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredBadges.map((badge) => (
                                <BadgeCard 
                                    key={badge.id} 
                                    badge={badge} 
                                    onViewCriteria={(b) => console.log("Viewing criteria for:", b.name, b.criteria)} 
                                />
                            ))}
                            {filteredBadges.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8 col-span-full">No badges found matching your search.</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
            <OpenBadgesInfo />
        </div>
    );
}