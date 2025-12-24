"use client";

import { useEffect, useState } from "react";
import { getFeaturedContent } from "@/app/local-music-network/actions/featured";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Music, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface FeaturedData {
    featuredMusician: any;
    featuredBand: any;
    featuredGig: any;
}

export function FeaturedContent() {
    const [data, setData] = useState<FeaturedData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getFeaturedContent();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch featured content:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Featured Musician */}
            {data.featuredMusician ? (
                <Link href={`/musicians/${data.featuredMusician.id}`} className="block h-full">
                    <Card className="hover-elevate h-full border-t-4 border-t-primary">
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={data.featuredMusician.profileImageUrl || ""} alt={data.featuredMusician.name} />
                                <AvatarFallback>{data.featuredMusician.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-lg">{data.featuredMusician.name}</CardTitle>
                                <div className="flex items-center text-xs text-muted-foreground bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full w-fit mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                                    Active Recently
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-1">
                                    {data.featuredMusician.instruments.slice(0, 3).map((inst: string) => (
                                        <Badge key={inst} variant="secondary" className="text-xs">
                                            {inst}
                                        </Badge>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    Connect with {data.featuredMusician.name} and check out their profile.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ) : (
                <Card className="h-full border-dashed flex items-center justify-center p-6 text-muted-foreground text-sm">
                    <p>No active musicians found recently.</p>
                </Card>
            )}

            {/* Featured Band */}
            {data.featuredBand ? (
                <Link href={`/bands/${data.featuredBand.id}`} className="block h-full">
                    <Card className="hover-elevate h-full border-t-4 border-t-primary">
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={data.featuredBand.profileImageUrl || ""} alt={data.featuredBand.name} />
                                <AvatarFallback className="bg-secondary/10 text-secondary">
                                    <Users className="h-6 w-6" />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-lg">{data.featuredBand.name}</CardTitle>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {data.featuredBand.location || "Victoria"}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-1">
                                    {data.featuredBand.genres.slice(0, 3).map((genre: string) => (
                                        <Badge key={genre} variant="secondary" className="text-xs">
                                            {genre}
                                        </Badge>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    Discover this local band making waves in the scene.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ) : (
                <Card className="h-full border-dashed flex items-center justify-center p-6 text-muted-foreground text-sm">
                    <p>No bands found.</p>
                </Card>
            )}

            {/* Featured Gig */}
            {data.featuredGig ? (
                <Link href={`/gigs/${data.featuredGig.id}`} className="block h-full">
                    <Card className="hover-elevate h-full border-t-4 border-t-primary">
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs flex-col leading-none shrink-0">
                                <span className="text-[10px] uppercase font-semibold">{format(new Date(data.featuredGig.date), "MMM")}</span>
                                <span className="text-lg font-bold">{format(new Date(data.featuredGig.date), "d")}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg truncate">{data.featuredGig.title}</CardTitle>
                                <div className="flex items-center text-xs text-muted-foreground mt-1 truncate">
                                    <MapPin className="h-3 w-3 mr-1 shrink-0" />
                                    <span className="truncate">{data.featuredGig.location}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-1">
                                    <Badge variant="secondary" className="text-xs font-medium">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {format(new Date(data.featuredGig.date), "h:mm a")}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    Don't miss this upcoming gig!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ) : (
                <Card className="h-full border-dashed flex items-center justify-center p-6 text-muted-foreground text-sm">
                    <p>No upcoming gigs soon.</p>
                </Card>
            )}
        </div>
    );
}
