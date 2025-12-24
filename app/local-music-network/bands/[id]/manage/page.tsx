"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Local Music Network/Header";
import { Footer } from "@/components/Local Music Network/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Trash2 } from "lucide-react";
import type { Band, BandMemberWithUser } from "@shared/schema";
import { BandProfileForm } from "@/components/Local Music Network/BandProfileForm";

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

export default function ManageBandPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
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

    // Simple auth check - reliable check happens on server
    if (!authLoading && !user) {
        router.push("/login");
        return null;
    }

    if (bandLoading || membersLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!band) return <div>Band not found</div>;

    // Client-side permission check (UX only)
    const isAdmin = band.userId === user?.id || members?.some(m => m.userId === user?.id && m.role === 'admin');

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
                    <p>You do not have permission to manage this band.</p>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Manage Band: {band.name}</h1>
                    <Button variant="outline" onClick={() => router.push(`/bands/${bandId}`)}>
                        View Public Profile
                    </Button>
                </div>

                <Tabs defaultValue="details">
                    <TabsList>
                        <TabsTrigger value="details">Band Details</TabsTrigger>
                        <TabsTrigger value="members">Members</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="mt-6">
                        <div className="max-w-xl">
                            <h2 className="text-xl font-semibold mb-4">Edit Details</h2>
                            <BandProfileForm
                                band={band}
                                onSuccess={() => {
                                    queryClient.invalidateQueries({ queryKey: ["band", bandId] });
                                    // Maybe toast handled in form
                                }}
                                onCancel={() => router.push(`/bands/${bandId}`)}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="members" className="mt-6">
                        <div className="max-w-2xl">
                            <h2 className="text-xl font-semibold mb-4">Manage Members</h2>
                            <AddMemberForm bandId={bandId} />

                            <div className="mt-8 space-y-4">
                                {members?.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-4 border rounded bg-card">
                                        <div>
                                            <p className="font-medium">{member.user.firstName} {member.user.lastName} ({member.user.email})</p>
                                            <div className="flex gap-2 text-sm text-muted-foreground">
                                                <span>{member.instrument}</span>
                                                <span className="capitalize">• {member.role}</span>
                                            </div>
                                        </div>
                                        {/* Don't allow removing self to prevent lockout, or maybe allow if other admin exists? keeping simple */}
                                        {member.userId !== user?.id && (
                                            <Button variant="ghost" size="icon" className="text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                                {/* Implement delete logic */}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
            <Footer />
        </div>
    );
}

function AddMemberForm({ bandId }: { bandId: string }) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");
    const [instrument, setInstrument] = useState("");
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const addMemberMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/bands/${bandId}/members`, {
                method: 'POST',
                body: JSON.stringify({ email, role, instrument }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to add member");
            return data;
        },
        onSuccess: () => {
            toast({ title: "Member invited", description: "User has been added to the band." });
            setEmail("");
            setInstrument("");
            queryClient.invalidateQueries({ queryKey: ["bandMembers", bandId] });
        },
        onError: (err: Error) => {
            toast({ variant: "destructive", title: "Error", description: err.message });
        }
    });

    return (
        <div className="p-4 border rounded bg-muted/20 space-y-4">
            <h3 className="font-medium">Add New Member</h3>
            <div className="grid gap-4">
                <div>
                    <Label>User Email</Label>
                    <Input
                        placeholder="musician@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">User must already be registered.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Role</Label>
                        <select
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={role}
                            onChange={e => setRole(e.target.value)}
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <Label>Instrument</Label>
                        <Input
                            placeholder="e.g. Drums"
                            value={instrument}
                            onChange={e => setInstrument(e.target.value)}
                        />
                    </div>
                </div>
                <Button onClick={() => addMemberMutation.mutate()} disabled={addMemberMutation.isPending}>
                    {addMemberMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Member
                </Button>
            </div>
        </div>
    );
}
