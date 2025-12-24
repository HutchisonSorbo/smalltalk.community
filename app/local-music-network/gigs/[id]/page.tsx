"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Local Music Network/Header";
import { Footer } from "@/components/Local Music Network/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, MapPin, Music, Share2, Edit, Ticket, Users } from "lucide-react";
import { format } from "date-fns";
import { getGig } from "@/app/Local Music Network/actions/gigs";
import Link from "next/link";
import { ShareDialog } from "@/components/Local Music Network/ShareDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function GigDetailPage() {
    const params = useParams();
    const router = useRouter();
    const gigId = params?.id as string;
    const { user } = useAuth();

    const { data: gig, isLoading } = useQuery({
        queryKey: ["gig", gigId],
        queryFn: () => getGig(gigId),
        enabled: !!gigId
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <Skeleton className="h-64 w-full rounded-xl" />
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-2/3" />
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!gig) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold mb-4">Gig Not Found</h1>
                    <Button onClick={() => router.push("/gigs")}>Browse Gigs</Button>
                </main>
                <Footer />
            </div>
        );
    }

    // Permission check
    const isCreator = user?.id === gig.creatorId;
    const isManager = gig.managers.some((m: any) => m.userId === user?.id);
    const canEdit = isCreator || isManager;

    // Determine host info
    const hostName = gig.band?.name || gig.musician?.name || "Unknown Host";
    const hostImage = gig.band?.profileImageUrl || gig.musician?.profileImageUrl;
    const hostLink = gig.band ? `/bands/${gig.band.id}` : gig.musician ? `/musicians/${gig.musician.id}` : "#";

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <div className="relative h-[400px] bg-muted overflow-hidden group">
                    {/* Background Cover */}
                    {gig.coverImageUrl ? (
                        <img
                            src={gig.coverImageUrl}
                            alt="Cover"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/30 to-secondary/30 flex items-center justify-center">
                            {!gig.imageUrl && <Music className="h-32 w-32 text-muted-foreground/20" />}
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 flex items-end">
                        <div className="container mx-auto px-4 pb-12">
                            <div className="flex flex-col md:flex-row items-end gap-6">
                                {/* Poster/Profile Image (if distinct from cover) */}
                                {gig.imageUrl && (
                                    <div className="h-48 w-48 rounded-lg overflow-hidden border-4 border-background shadow-xl shrink-0 hidden md:block">
                                        <img src={gig.imageUrl} alt={gig.title} className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <div className="flex-1 space-y-4">
                                    <Badge className="mb-2" variant="secondary">
                                        {format(new Date(gig.date), "MMMM d, yyyy")}
                                    </Badge>
                                    <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">{gig.title}</h1>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-5 w-5" />
                                        <span className="text-lg">{gig.location}</span>
                                    </div>
                                </div>

                                {canEdit && (
                                    <Button onClick={() => router.push(`/gigs/${gig.id}/edit`)} variant="outline" className="bg-background/80 backdrop-blur-sm mb-1">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Manage Event
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Mobile Poster Toggle */}
                            {gig.imageUrl && (
                                <div className="md:hidden rounded-lg overflow-hidden border border-border shadow-sm">
                                    <img src={gig.imageUrl} alt={gig.title} className="w-full h-auto" />
                                </div>
                            )}

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">About the Event</h2>
                                <div className="prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                                    {gig.description || "No description provided."}
                                </div>
                            </section>

                            {/* ... Rest of content ... */}
                            {gig.genre && (
                                <section>
                                    <h3 className="font-semibold mb-2">Genre</h3>
                                    <Badge variant="outline">{gig.genre}</Badge>
                                </section>
                            )}

                            <section className="pt-4 border-t">
                                <h3 className="font-semibold mb-4">Hosted By</h3>
                                <Link href={hostLink} className="flex items-center gap-4 group p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={hostImage || ""} />
                                        <AvatarFallback>{hostName.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-lg group-hover:text-primary transition-colors">{hostName}</p>
                                        <p className="text-sm text-muted-foreground">View Profile</p>
                                    </div>
                                </Link>
                            </section>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{format(new Date(gig.date), "EEEE, MMMM d")}</p>
                                                <p className="text-sm text-muted-foreground">{format(new Date(gig.date), "h:mm a")}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Ticket className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">
                                                    {gig.price ? (typeof gig.price === 'number' ? `$${(gig.price / 100).toFixed(2)}` : gig.price) : "Free"}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Entry Fee</p>
                                            </div>
                                        </div>
                                    </div>

                                    {gig.ticketUrl && (
                                        <Button className="w-full" size="lg" asChild>
                                            <a href={gig.ticketUrl} target="_blank" rel="noopener noreferrer">
                                                Get Tickets
                                            </a>
                                        </Button>
                                    )}

                                    <ShareDialog
                                        title={gig.title}
                                        url={typeof window !== 'undefined' ? window.location.href : undefined}
                                        trigger={
                                            <Button variant="secondary" className="w-full">
                                                <Share2 className="mr-2 h-4 w-4" />
                                                Share Event
                                            </Button>
                                        }
                                    />
                                </CardContent>
                            </Card>

                            {canEdit && gig.managers.length > 0 && (
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold mb-3 flex items-center">
                                            <Users className="h-4 w-4 mr-2" />
                                            Event Managers
                                        </h3>
                                        <div className="space-y-2">
                                            {gig.managers.map((m: any) => (
                                                <div key={m.id} className="flex items-center gap-2 text-sm">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback>{m.user?.firstName?.[0] || "?"}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{m.user?.firstName || "User"} {m.user?.lastName}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
