"use client";


import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/local-music-network/Header";
import { Footer } from "@/components/local-music-network/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ArrowLeft, Trash2, Plus, Users, Save, Upload } from "lucide-react";
import { getGig, updateGig, addGigManager, removeGigManager } from "@/app/local-music-network/actions/gigs";
import { uploadFile } from "@/app/local-music-network/actions/upload";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

export default function EditGigPage() {
    const params = useParams();
    const router = useRouter();
    const gigId = params?.id as string;
    const { user, isLoading: authLoading } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Form State
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [genre, setGenre] = useState("");
    const [price, setPrice] = useState("");
    const [ticketUrl, setTicketUrl] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [coverImageUrl, setCoverImageUrl] = useState("");

    // Upload State
    const [uploadingField, setUploadingField] = useState<"poster" | "cover" | null>(null);
    const posterInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    // Manager State
    const [newManagerEmail, setNewManagerEmail] = useState("");

    const { data: gig, isLoading: gigLoading } = useQuery({
        queryKey: ["gig", gigId],
        queryFn: () => getGig(gigId),
        enabled: !!gigId
    });

    useEffect(() => {
        if (gig) {
            setTitle(gig.title);
            // Format date for datetime-local input
            const d = new Date(gig.date);
            const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            setDate(localIso);

            setLocation(gig.location);
            setDescription(gig.description || "");
            setGenre(gig.genre || "");
            setPrice(gig.price ? (typeof gig.price === 'number' ? gig.price.toString() : gig.price) : "");
            setTicketUrl(gig.ticketUrl || "");
            setImageUrl(gig.imageUrl || "");
            setCoverImageUrl(gig.coverImageUrl || "");
        }
    }, [gig]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "poster" | "cover") => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingField(field);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await uploadFile(formData);
            if (res.success && res.url) {
                if (field === "poster") setImageUrl(res.url);
                if (field === "cover") setCoverImageUrl(res.url);
                toast({ title: "Upload complete" });
            } else {
                toast({ variant: "destructive", title: "Upload failed", description: res.error || "Unknown error" });
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            toast({ variant: "destructive", title: "Upload failed", description: errorMessage });
        } finally {
            setUploadingField(null);
            // Reset input value to allow re-uploading the same file
            if (field === "poster" && posterInputRef.current) {
                posterInputRef.current.value = "";
            }
            if (field === "cover" && coverInputRef.current) {
                coverInputRef.current.value = "";
            }
        }
    };

    const updateMutation = useMutation({
        mutationFn: async () => {
            await updateGig(gigId, {
                title,
                date: new Date(date),
                location,
                description,
                genre,
                price: price ? (isNaN(Number(price)) ? null : Number(price)) : null,
                ticketUrl,
                imageUrl,
                coverImageUrl
            });
        },
        onSuccess: () => {
            toast({ title: "Gig updated", description: "Changes saved successfully." });
            queryClient.invalidateQueries({ queryKey: ["gig", gigId] });
            router.push(`/gigs/${gigId}`);
        },
        onError: (err: Error) => {
            toast({ variant: "destructive", title: "Update Failed", description: err.message });
        }
    });

    const addManagerMutation = useMutation({
        mutationFn: async (email: string) => {
            await addGigManager(gigId, email);
        },
        onSuccess: () => {
            toast({ title: "Manager added", description: "User can now edit this gig." });
            setNewManagerEmail("");
            queryClient.invalidateQueries({ queryKey: ["gig", gigId] });
        },
        onError: (err: Error) => {
            toast({ variant: "destructive", title: "Failed to add manager", description: err.message });
        }
    });

    const removeManagerMutation = useMutation({
        mutationFn: async (userId: string) => {
            await removeGigManager(gigId, userId);
        },
        onSuccess: () => {
            toast({ title: "Manager removed" });
            queryClient.invalidateQueries({ queryKey: ["gig", gigId] });
        },
        onError: (err: Error) => {
            toast({ variant: "destructive", title: "Failed to remove manager", description: err.message });
        }
    });

    if (authLoading || gigLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!gig) return <div className="text-center py-20">Gig not found</div>;

    // Check permission logic again just in case, though server handles it.
    // Ideally redirect if not permitted.

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <h1 className="text-2xl font-bold">Edit Gig</h1>
                        </div>
                        <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || !!uploadingField}>
                            {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Event Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Event Title</Label>
                                        <Input value={title} onChange={e => setTitle(e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Date & Time</Label>
                                            <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Genre</Label>
                                            <Input value={genre} onChange={e => setGenre(e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Location</Label>
                                        <Input value={location} onChange={e => setLocation(e.target.value)} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label>Poster/Profile Image</Label>
                                            <div className="flex gap-2 mt-2">
                                                <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
                                                <input
                                                    type="file"
                                                    ref={posterInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleUpload(e, 'poster')}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    disabled={!!uploadingField}
                                                    onClick={() => posterInputRef.current?.click()}
                                                >
                                                    {uploadingField === 'poster' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Cover Image</Label>
                                            <div className="flex gap-2 mt-2">
                                                <Input value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} placeholder="https://..." />
                                                <input
                                                    type="file"
                                                    ref={coverInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleUpload(e, 'cover')}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    disabled={!!uploadingField}
                                                    onClick={() => coverInputRef.current?.click()}
                                                >
                                                    {uploadingField === 'cover' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Description</Label>
                                        <Textarea className="min-h-[150px]" value={description} onChange={e => setDescription(e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Entry Price</Label>
                                            <Input value={price} onChange={e => setPrice(e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Ticket URL</Label>
                                            <Input value={ticketUrl} onChange={e => setTicketUrl(e.target.value)} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Team Management
                                    </CardTitle>
                                    <CardDescription>
                                        Add other users to help manage this event listing.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Add by Email</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="user@example.com"
                                                value={newManagerEmail}
                                                onChange={e => setNewManagerEmail(e.target.value)}
                                            />
                                            <Button size="icon" onClick={() => addManagerMutation.mutate(newManagerEmail)} disabled={addManagerMutation.isPending || !newManagerEmail}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold">Current Managers</h4>
                                        <div className="space-y-2">
                                            {/* Creator */}
                                            <div className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <span className="truncate flex-1">
                                                        {gig.creator?.firstName || "Creator"} (Owner)
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Managers */}
                                            {gig.managers?.map((m) => (
                                                <div key={m.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm group">
                                                    <span className="truncate max-w-[150px]">
                                                        {m.user?.firstName || m.user?.email || "User"}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeManagerMutation.mutate(m.userId)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}

                                            {(!gig.managers || gig.managers.length === 0) && (
                                                <p className="text-xs text-muted-foreground italic">No additional managers.</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

// CodeRabbit Audit Trigger
