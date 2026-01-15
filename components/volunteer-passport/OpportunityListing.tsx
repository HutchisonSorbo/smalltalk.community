"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Building2, CheckCircle, Cloud, CloudOff } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDittoSync } from "@/hooks/useDittoSync";
import { useAuth } from "@/hooks/useAuth";
import type { VolunteerRole } from "@shared/schema";

// Extend VolunteerRole to include the organization relation if available
interface RoleWithOrg extends VolunteerRole {
    organisation?: {
        name: string;
    };
}

interface OpportunityListingProps {
    role: RoleWithOrg;
    isApplied?: boolean;
    tenantId: string; // Added tenantId prop
}

interface VolunteerApplication {
    _id: string;
    roleId: string;
    volunteerId: string;
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
    updatedAt: string;
}

export function OpportunityListing({ role, isApplied: initialIsApplied, tenantId }: OpportunityListingProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isApplied, setIsApplied] = useState(initialIsApplied);
    const [isApplying, setIsApplying] = useState(false);

    const { insert, isOnline } = useDittoSync<VolunteerApplication>({
        collection: "volunteer_applications",
        tenantId, // Pass tenantId
    });

    const handleApply = async () => {
        if (!user) {
            toast({
                title: "Authentication Required",
                description: "You must be logged in to apply for roles.",
                variant: "destructive",
            });
            return;
        }

        setIsApplying(true);
        try {
            await insert({
                roleId: role.id,
                volunteerId: user.id,
                status: "pending",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            setIsApplied(true);
            toast({
                title: isOnline ? "Application Sent" : "Applied Offline",
                description: isOnline
                    ? "The organisation has been notified of your interest."
                    : "Saved locally. Your application will sync once you're back online.",
            });
        } catch (error) {
            console.error("[OpportunityListing] Apply error:", error);
            toast({
                title: "Error",
                description: "Failed to submit application. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsApplying(false);
        }
    };

    const getRoleTypeBadge = (type: string | null) => {
        switch (type) {
            case "ongoing":
                return <Badge variant="default">Ongoing</Badge>;
            case "one_off":
                return <Badge variant="secondary">One-off</Badge>;
            case "event_based":
                return <Badge variant="outline">Event</Badge>;
            default:
                return <Badge variant="outline">{type || "Unknown"}</Badge>;
        }
    };

    const getLocationTypeBadge = (type: string | null) => {
        switch (type) {
            case "remote":
                return <Badge variant="secondary">Remote</Badge>;
            case "hybrid":
                return <Badge variant="outline">Hybrid</Badge>;
            default:
                return <Badge variant="outline">On-site</Badge>;
        }
    };

    return (
        <Card className="flex flex-col h-full border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-medium">
                                    {role.organisation?.name || "Community Organisation"}
                                </span>
                                <CheckCircle className="h-3.5 w-3.5 text-blue-500" />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {isOnline ? (
                            <Cloud className="w-3 h-3 text-green-500" aria-label="Online" />
                        ) : (
                            <CloudOff className="w-3 h-3 text-orange-500" aria-label="Offline" />
                        )}
                    </div>
                </div>
                <CardTitle className="mt-3 text-xl">{role.title}</CardTitle>
                <div className="flex gap-2 mt-2">
                    {getRoleTypeBadge(role.roleType)}
                    {getLocationTypeBadge(role.locationType)}
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {role.description}
                </p>
                {role.address && (
                    <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{role.address}</span>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={handleApply}
                    disabled={isApplying || isApplied}
                    variant={isApplied ? "outline" : "default"}
                >
                    {isApplying ? (
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : isApplied ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                    ) : null}
                    {isApplying ? "Applying..." : isApplied ? "Applied" : "Apply Now"}
                </Button>
            </CardFooter>
        </Card>
    );
}
