"use client";

import Link from "next/link";
import { Plus, Users, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Band } from "@shared/schema";

interface BandListProps {
    bands?: Band[];
    isLoading: boolean;
}

export function BandList({ bands, isLoading }: BandListProps) {
    if (isLoading) {
        return (
            <div className="space-y-6">
                <BandListHeader />
                <div className="grid gap-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={`skeleton-${i}`} className="h-32 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (!bands || bands.length === 0) {
        return (
            <div className="space-y-6">
                <BandListHeader />
                <Card>
                    <CardContent className="p-12 text-center">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No bands registered</h3>
                        <p className="text-muted-foreground mb-4">
                            Create a band profile to advertise your music and gigs.
                        </p>
                        <Button asChild>
                            <Link href="/bands/new">
                                <Plus className="h-4 w-4 mr-2" />
                                Register Your Band
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <BandListHeader />
            <div className="grid gap-4">
                {bands.map((band) => (
                    <Card key={band.id}>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-24 h-24 rounded-md bg-muted overflow-hidden shrink-0">
                                    {band.profileImageUrl ? (
                                        <img
                                            src={band.profileImageUrl}
                                            alt={band.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary uppercase text-2xl font-bold">
                                            {band.name.substring(0, 2)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <h3 className="font-semibold text-lg truncate">{band.name}</h3>
                                    </div>
                                    <div className="space-y-1 mt-1">
                                        {band.location && (
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span className="truncate">{band.location}</span>
                                            </div>
                                        )}
                                        {band.websiteUrl && (
                                            <div className="flex items-center gap-1 text-sm text-primary">
                                                <Globe className="h-3.5 w-3.5" />
                                                <a href={band.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    <span className="truncate max-w-[200px] block">
                                                        {band.websiteUrl}
                                                    </span>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {band.genres && band.genres.map(g => (
                                            <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function BandListHeader() {
    return (
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Band Profiles</h2>
            <Button asChild data-testid="button-register-band">
                <Link href="/bands/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Register Band
                </Link>
            </Button>
        </div>
    );
}

// CodeRabbit Audit Trigger
