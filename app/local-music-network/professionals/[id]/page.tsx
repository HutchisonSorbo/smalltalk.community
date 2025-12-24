"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Local Music Network/Header";
import { Footer } from "@/components/Local Music Network/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Globe, Mail, Instagram, ArrowLeft, ExternalLink, Briefcase, Check, Phone, Facebook, Linkedin, Twitter } from "lucide-react";
import { ProfessionalProfile } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export default function ProfessionalDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const id = params.id as string;

    const { data: pro, isLoading, error } = useQuery<ProfessionalProfile & { user?: any }>({
        queryKey: [`/api/professionals/${id}`],
        queryFn: async () => {
            const res = await fetch(`/api/professionals/${id}`);
            if (!res.ok) throw new Error("Not found");
            return res.json();
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8">
                    <Skeleton className="h-8 w-1/3 mb-6" />
                    <Skeleton className="h-[400px] w-full" />
                </main>
            </div>
        );
    }

    if (error || !pro) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-12 text-center">
                    <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
                    <Button onClick={() => router.push("/professionals")}>
                        Back to Directory
                    </Button>
                </main>
            </div>
        );
    }

    const isOwner = user?.id === pro.userId;

    // Helper to ensure URL has protocol
    const getSafeUrl = (url?: string) => {
        if (!url) return undefined;
        if (url.startsWith('http')) return url;
        return `https://${url}`;
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Button variant="ghost" className="mb-6 pl-0" onClick={() => router.push("/professionals")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Directory
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Info Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-t-4 border-t-purple-500">
                            <CardHeader className="text-center">
                                <Avatar className="h-24 w-24 mx-auto mb-4">
                                    <AvatarImage
                                        src={pro.profileImageUrl || undefined}
                                        alt={pro.businessName || "Profile"}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-purple-100 dark:bg-purple-900/20">
                                        <Briefcase className="h-10 w-10 text-purple-600 dark:text-purple-300" />
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-2xl">{pro.businessName}</CardTitle>
                                <Badge variant="secondary" className="mt-2 bg-purple-100 text-purple-800">
                                    {pro.role}
                                </Badge>
                                <div className="flex items-center justify-center text-muted-foreground mt-4">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {pro.location}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isOwner && (
                                    <Button className="w-full" variant="outline" asChild>
                                        <Link href="/dashboard/professional">Edit Profile</Link>
                                    </Button>
                                )}

                                <div className="space-y-2 pt-4 border-t">
                                    {pro.website && (
                                        <a href={getSafeUrl(pro.website)} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm hover:text-primary transition-colors">
                                            <Globe className="h-4 w-4 mr-3 text-muted-foreground" />
                                            Website
                                            <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
                                        </a>
                                    )}
                                    {pro.instagramUrl && (
                                        <a href={getSafeUrl(pro.instagramUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm hover:text-primary transition-colors">
                                            <Instagram className="h-4 w-4 mr-3 text-muted-foreground" />
                                            Instagram
                                            <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
                                        </a>
                                    )}
                                    {pro.facebookUrl && (
                                        <a href={getSafeUrl(pro.facebookUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm hover:text-primary transition-colors">
                                            <Facebook className="h-4 w-4 mr-3 text-muted-foreground" />
                                            Facebook
                                            <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
                                        </a>
                                    )}
                                    {pro.linkedinUrl && (
                                        <a href={getSafeUrl(pro.linkedinUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm hover:text-primary transition-colors">
                                            <Linkedin className="h-4 w-4 mr-3 text-muted-foreground" />
                                            LinkedIn
                                            <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
                                        </a>
                                    )}
                                    {pro.twitterUrl && (
                                        <a href={getSafeUrl(pro.twitterUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm hover:text-primary transition-colors">
                                            <Twitter className="h-4 w-4 mr-3 text-muted-foreground" />
                                            Twitter
                                            <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
                                        </a>
                                    )}

                                    <ProfessionalContactSection
                                        profile={pro}
                                        user={user ?? null}
                                        isAuthenticated={isAuthenticated}
                                    />
                                </div>

                                {pro.rates && (
                                    <div className="pt-4 border-t">
                                        <h4 className="text-sm font-semibold mb-2">Rates</h4>
                                        <p className="text-sm text-muted-foreground">{pro.rates}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Bio & Services */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>About</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap leading-relaxed">
                                    {pro.bio}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Services Offered</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                                    {pro.services}
                                </p>
                            </CardContent>
                        </Card>

                        {pro.portfolioUrl && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Portfolio</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <a
                                        href={getSafeUrl(pro.portfolioUrl)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center md:inline-flex p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                                    >
                                        <Globe className="h-5 w-5 mr-3" />
                                        <div>
                                            <div className="font-medium">View Portfolio / Website</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">{pro.portfolioUrl}</div>
                                        </div>
                                        <ExternalLink className="h-4 w-4 ml-4" />
                                    </a>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

function ProfessionalContactSection({ profile, user, isAuthenticated }: { profile: ProfessionalProfile, user: any, isAuthenticated: boolean }) {
    const { toast } = useToast();

    // Query for request status
    const { data: requestStatus, refetch } = useQuery({
        queryKey: ['contact-request', profile.userId],
        queryFn: async () => {
            if (!isAuthenticated || !user) return null;
            try {
                const res = await fetch(`/api/contact-requests/check?recipientId=${profile.userId}`);
                if (res.ok) return res.json();
                return null;
            } catch (e) {
                return null;
            }
        },
        enabled: isAuthenticated && !profile.isContactInfoPublic && user?.id !== profile.userId
    });

    const requestMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/contact-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientId: profile.userId })
            });
            if (!res.ok) {
                if (res.status === 401) throw new Error("Please log in first");
                throw new Error("Failed to send request");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Request sent", description: "The professional has been notified." });
            refetch();
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const isOwner = user?.id === profile.userId;
    const isPublic = profile.isContactInfoPublic;
    const hasAccess = isOwner || isPublic || requestStatus?.status === 'accepted';
    const isPending = requestStatus?.status === 'pending';

    if (hasAccess) {
        return (
            <>
                {profile.contactEmail && (
                    <a href={`mailto:${profile.contactEmail}`} className="flex items-center text-sm hover:text-primary transition-colors">
                        <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                        {profile.contactEmail}
                    </a>
                )}
                {profile.contactPhone && (
                    <a href={`tel:${profile.contactPhone}`} className="flex items-center text-sm hover:text-primary transition-colors">
                        <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                        {profile.contactPhone}
                    </a>
                )}
            </>
        );
    }

    return (
        <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-3 italic">
                Contact info is private.
            </p>
            {isPending ? (
                <Button disabled className="w-full h-8 text-xs" variant="outline">
                    <Check className="mr-2 h-3 w-3" />
                    Request Sent
                </Button>
            ) : (
                <Button
                    className="w-full h-8 text-xs"
                    variant="outline"
                    onClick={() => requestMutation.mutate()}
                    disabled={requestMutation.isPending}
                >
                    Request Contact Info
                </Button>
            )}
        </div>
    );
}
