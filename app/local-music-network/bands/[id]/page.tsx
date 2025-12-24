"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Header } from "@/components/Local Music Network/Header";
import { Footer } from "@/components/Local Music Network/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Music, UserIcon, Edit, Shield, Globe, Facebook, Instagram, Youtube, Headphones } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Band, BandMemberWithUser, Gig } from "@shared/schema";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

// Helper to fetch band details
async function getBand(id: string): Promise<Band> {
    const res = await fetch(`/api/bands/${id}`);
    if (!res.ok) throw new Error("Failed to fetch band");
    return res.json();
}

async function getMembers(id: string): Promise<BandMemberWithUser[]> {
    const res = await fetch(`/api/bands/${id}/members`);
    if (!res.ok) throw new Error("Failed to fetch members");
    return res.json();
}

async function getGigs(bandId: string): Promise<Gig[]> {
    const res = await fetch(`/api/gigs?bandId=${bandId}&date=upcoming`);
    // Note: API route support for bandId filter needs to be verified or implemented in getGigs logic above
    // I recall creating GET /api/gigs?params...
    if (!res.ok) throw new Error("Failed to fetch gigs");
    return res.json();
}

export default function BandDetailsPage() {
    const params = useParams<{ id: string }>();
    const { user } = useAuth();
    const bandId = params.id;

    const { data: band, isLoading: bandLoading } = useQuery({
        queryKey: ["band", bandId],
        queryFn: () => getBand(bandId),
    });

    const { data: members, isLoading: membersLoading } = useQuery({
        queryKey: ["bandMembers", bandId],
        queryFn: () => getMembers(bandId),
        enabled: !!band,
    });

    // Check if user is admin
    const isOwner = band?.userId === user?.id;
    const isAdminMember = members?.some(m => m.userId === user?.id && m.role === 'admin');
    const canEdit = isOwner || isAdminMember;

    if (bandLoading) return <BandDetailsSkeleton />;
    if (!band) return <div className="text-center py-20">Band not found</div>;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Hero / Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b pb-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl font-bold">{band.name}</h1>
                            {canEdit && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/bands/${bandId}/manage`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Manage Band
                                    </Link>
                                </Button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4 mt-4 text-muted-foreground">
                            {band.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{band.location}</span>
                                </div>
                            )}
                            {band.websiteUrl && (
                                <a href={band.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                    <Globe className="h-4 w-4" />
                                    <span>Website</span>
                                </a>
                            )}
                            {(band.socialLinks as any)?.facebook && (
                                <a href={(band.socialLinks as any).facebook} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                                    <Facebook className="h-4 w-4" />
                                </a>
                            )}
                            {(band.socialLinks as any)?.instagram && (
                                <a href={(band.socialLinks as any).instagram} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                                    <Instagram className="h-4 w-4" />
                                </a>
                            )}
                            {(band.socialLinks as any)?.tiktok && (
                                <a href={(band.socialLinks as any).tiktok} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                                </a>
                            )}
                            {(band.socialLinks as any)?.snapchat && (
                                <a href={(band.socialLinks as any).snapchat} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 2c-3 0-5.3 1.3-6.1 3.5C5 7.7 5.7 8.7 5.7 8.7s-.9.7-.9 2c0 1.2 1 2.2 1 2.2s.5 4.6 6.2 4.6 6.2-4.6 6.2-4.6 1-1 1-2.2c0-1.3-.9-2-.9-2s.7-1 .2-3.2C17.3 3.3 15 2 12 2z" /></svg>
                                </a>
                            )}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {band.genres?.map((genre) => (
                                <span key={genre} className="px-3 py-1 bg-secondary rounded-full text-secondary-foreground text-sm">
                                    {genre}
                                </span>
                            ))}
                        </div>
                    </div>
                    {/* Image placeholder or component */}
                    <div className="w-full md:w-1/3 aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                        {band.profileImageUrl ? (
                            <img src={band.profileImageUrl} alt={band.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <Music className="h-16 w-16 opacity-20" />
                        )}
                    </div>
                </div>

                {/* Bio */}
                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="prose dark:prose-invert max-w-none">
                            <h2 className="text-2xl font-semibold mb-4">About Us</h2>
                            <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                                {band.bio || "No bio available."}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {band.influences && band.influences.length > 0 && (
                            <div className="p-6 rounded-lg border bg-card">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Headphones className="h-4 w-4 text-primary" />
                                    Influences
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {band.influences.map((influence, i) => (
                                        <span
                                            key={i}
                                            className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-sm font-medium"
                                        >
                                            {influence}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Separator className="my-8" />

                {/* Members */}
                <section className="py-8">
                    <h2 className="text-2xl font-semibold mb-6">Band Members</h2>
                    {membersLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {members?.map((member) => (
                                <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        {member.user.profileImageUrl ? (
                                            <img src={member.user.profileImageUrl} className="h-12 w-12 rounded-full object-cover" />
                                        ) : <UserIcon className="h-6 w-6 text-primary" />}
                                    </div>
                                    <div>
                                        <p className="font-medium">{member.user.firstName} {member.user.lastName}</p>
                                        <p className="text-sm text-muted-foreground">{member.instrument || "Member"}</p>
                                        {member.role === 'admin' && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Admin</span>}
                                    </div>
                                </div>
                            ))}
                            {(!members || members.length === 0) && <p className="text-muted-foreground">No members listed yet.</p>}
                        </div>
                    )}
                </section>

                <Separator className="my-8" />

                {/* Sound Check */}
                {(band.socialLinks as any) && (Object.keys(band.socialLinks as any).length > 0) && (
                    <section className="py-8">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Headphones className="h-5 w-5 text-primary" />
                            Sound Check
                        </h2>
                        <div className="space-y-6">
                            {(band.socialLinks as any).youtube && (
                                <div className="aspect-video w-full rounded-lg overflow-hidden shadow-sm">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${(band.socialLinks as any).youtube.split('v=')[1]?.split('&')[0] || (band.socialLinks as any).youtube.split('/').pop()}`}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            )}

                            {(band.socialLinks as any).spotify && (
                                <div className="rounded-lg overflow-hidden shadow-sm">
                                    <iframe
                                        style={{ borderRadius: "12px" }}
                                        src={`https://open.spotify.com/embed/${(band.socialLinks as any).spotify.includes('track') ? 'track' : 'artist'}/${(band.socialLinks as any).spotify.split('/').pop()?.split('?')[0]}`}
                                        width="100%"
                                        height="152"
                                        frameBorder="0"
                                        allowFullScreen
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                        loading="lazy"
                                    ></iframe>
                                </div>
                            )}

                            {(band.socialLinks as any).soundcloud && (
                                <div className="rounded-lg overflow-hidden shadow-sm">
                                    <iframe
                                        width="100%"
                                        height="166"
                                        scrolling="no"
                                        frameBorder="0"
                                        allow="autoplay"
                                        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent((band.socialLinks as any).soundcloud)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`}
                                    ></iframe>
                                </div>
                            )}

                            {(band.socialLinks as any).appleMusic && (
                                <div className="rounded-lg overflow-hidden shadow-sm">
                                    <iframe
                                        allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                                        frameBorder="0"
                                        height="175"
                                        style={{ width: "100%", maxWidth: "660px", overflow: "hidden", borderRadius: "10px" }}
                                        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                                        src={`https://embed.music.apple.com/${(band.socialLinks as any).appleMusic.split('music.apple.com/')[1]}`}
                                    ></iframe>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                <Separator className="my-8" />

                {/* Gigs Placeholder - Will implement full list */}
                <section className="py-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold">Upcoming Gigs</h2>
                        {/* Add Gig button removed as per user request to prevent misuse */}
                    </div>
                    {/* We need to implement gigs fetching specifically for this band */}
                    <BandGigsList bandId={bandId} />
                </section>

            </main>
            <Footer />
        </div>
    );
}

function BandGigsList({ bandId }: { bandId: string }) {
    const { data: gigs, isLoading } = useQuery({
        queryKey: ["gigs", "band", bandId],
        queryFn: () => getGigs(bandId),
    });

    if (isLoading) return <Skeleton className="h-32 w-full" />;

    if (!gigs || gigs.length === 0) {
        return <p className="text-muted-foreground italic">No upcoming gigs scheduled.</p>;
    }

    return (
        <div className="space-y-4">
            {gigs.map(gig => (
                <div key={gig.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                    <div className="md:w-32 flex flex-col justify-center items-center bg-primary/5 rounded p-2 text-center">
                        <span className="text-2xl font-bold text-primary">{new Date(gig.date).getDate()}</span>
                        <span className="text-sm font-uppercase">{new Date(gig.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold">{gig.title}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <MapPin className="h-4 w-4" /> {gig.location}
                        </div>
                        <p className="mt-2 line-clamp-2">{gig.description}</p>
                    </div>
                    <div className="flex flex-col justify-center gap-2 min-w-[120px]">
                        {gig.ticketUrl && (
                            <Button asChild variant="default" size="sm">
                                <a href={gig.ticketUrl} target="_blank" rel="noopener noreferrer">Get Tickets</a>
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}


function BandDetailsSkeleton() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
                <div className="h-64 bg-muted rounded-lg w-full animate-pulse" />
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </main>
            <Footer />
        </div>
    );
}

import { Plus } from "lucide-react";

