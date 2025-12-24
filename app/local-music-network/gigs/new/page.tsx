"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Local Music Network/Header";
import { Footer } from "@/components/Local Music Network/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import type { Band, MusicianProfile } from "@shared/schema";

async function getMyBands(): Promise<Band[]> {
    const res = await fetch("/api/bands?my=true");
    if (!res.ok) return []; // Fallback
    return res.json();
}

async function getMyMusicianProfiles(): Promise<MusicianProfile[]> {
    const res = await fetch("/api/my/profiles");
    if (!res.ok) throw new Error("Failed to fetch profiles");
    return res.json();
}


function CreateGigContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isLoading: authLoading } = useAuth();
    const { toast } = useToast();

    const preselectedBandId = searchParams.get('bandId');

    // Form State
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [genre, setGenre] = useState("");
    const [price, setPrice] = useState(""); // text
    const [ticketUrl, setTicketUrl] = useState("");
    const [hostType, setHostType] = useState<"band" | "musician">("band");
    const [selectedHostId, setSelectedHostId] = useState(preselectedBandId || "");

    const { data: myBands, isLoading: bandsLoading } = useQuery({
        queryKey: ["myBands"],
        queryFn: getMyBands,
        enabled: !!user
    });

    const { data: myProfiles, isLoading: profilesLoading } = useQuery({
        queryKey: ["myProfiles"],
        queryFn: getMyMusicianProfiles,
        enabled: !!user
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            if (!selectedHostId) throw new Error("Please select a host");

            const payload: any = {
                title,
                date: new Date(date).toISOString(),
                location,
                description,
                genre,
                price: parseInt(price) || 0, // assuming integer cents or just number
                ticketUrl,
                imageUrl: null, // Basic for now
            };

            if (hostType === 'band') {
                payload.bandId = selectedHostId;
            } else {
                payload.musicianId = selectedHostId;
            }

            const res = await fetch("/api/gigs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to create gig");
            return data;
        },
        onSuccess: () => {
            toast({ title: "Gig created!", description: "Your gig is now live." });
            router.push("/gigs");
        },
        onError: (err: Error) => {
            toast({ variant: "destructive", title: "Error", description: err.message });
        }
    });

    if (authLoading || bandsLoading || profilesLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user) {
        router.push("/auth"); // redirect if not logged in
        return null;
    }

    const hasBands = myBands && myBands.length > 0;
    const hasProfiles = myProfiles && myProfiles.length > 0;

    if (!hasBands && !hasProfiles) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8 text-center bg-background">
                    <h1 className="text-2xl font-bold mb-4">Create a Profile First</h1>
                    <p className="mb-6">You need to have a musician profile or manage a band to create a gig.</p>
                    <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto bg-card text-card-foreground p-6 rounded-lg shadow-sm border">
                    <h1 className="text-2xl font-bold mb-6">List a New Gig</h1>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Hosting As</Label>
                                <div className="flex gap-4 mt-2">
                                    {hasBands && (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="hostType"
                                                value="band"
                                                checked={hostType === 'band'}
                                                onChange={() => setHostType('band')}
                                            />
                                            Band
                                        </label>
                                    )}
                                    {hasProfiles && (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="hostType"
                                                value="musician"
                                                checked={hostType === 'musician'}
                                                onChange={() => setHostType('musician')}
                                            />
                                            Musician
                                        </label>
                                    )}
                                </div>

                                <div>
                                    <Label>Select {hostType === 'band' ? 'Band' : 'Profile'}</Label>
                                    <select
                                        className="w-full mt-1 p-2 border rounded bg-background"
                                        value={selectedHostId}
                                        onChange={e => setSelectedHostId(e.target.value)}
                                    >
                                        <option value="">Select...</option>
                                        {hostType === 'band'
                                            ? myBands?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)
                                            : myProfiles?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label>Event Title</Label>
                                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summer Rock Fest" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Date & Time</Label>
                                    <Input
                                        type="datetime-local"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Genre</Label>
                                    <Input value={genre} onChange={e => setGenre(e.target.value)} placeholder="e.g. Rock" />
                                </div>
                            </div>

                            <div>
                                <Label>Location</Label>
                                <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Venue name or address" />
                            </div>

                            <div>
                                <Label>Description</Label>
                                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell us about the gig..." />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Entry Price ($)</Label>
                                    <Input
                                        type="number"
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        placeholder="0 for free"
                                    />
                                </div>
                                <div>
                                    <Label>Ticket URL (Optional)</Label>
                                    <Input value={ticketUrl} onChange={e => setTicketUrl(e.target.value)} placeholder="https://..." />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                                <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !selectedHostId}>
                                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Gig
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function CreateGigPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <CreateGigContent />
        </Suspense>
    );
}

