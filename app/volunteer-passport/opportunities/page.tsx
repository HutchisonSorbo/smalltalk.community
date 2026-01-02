"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Clock, Building2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VolunteerRole {
    id: string;
    title: string;
    description: string;
    roleType: string;
    locationType: string;
    address: string | null;
    orgName: string | null;
    orgLogo: string | null;
    orgVerified: boolean | null;
    createdAt: string;
}

export default function OpportunitiesPage() {
    const [roles, setRoles] = useState<VolunteerRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [applying, setApplying] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchRoles() {
            try {
                const res = await fetch("/api/volunteer-passport/roles");
                const data = await res.json();
                if (data.roles) {
                    setRoles(data.roles);
                }
            } catch (error) {
                console.error(error);
                toast({
                    title: "Error",
                    description: "Failed to load opportunities.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchRoles();
    }, [toast]);

    const handleApply = async (roleId: string) => {
        setApplying(roleId);
        try {
            const res = await fetch("/api/volunteer-passport/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roleId }),
            });
            const data = await res.json();

            if (res.ok) {
                toast({
                    title: "Application Submitted",
                    description: "Your application has been sent to the organisation.",
                });
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to submit application.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to submit application.",
                variant: "destructive"
            });
        } finally {
            setApplying(null);
        }
    };

    const getRoleTypeBadge = (type: string) => {
        switch (type) {
            case "ongoing":
                return <Badge variant="default">Ongoing</Badge>;
            case "one_off":
                return <Badge variant="secondary">One-off</Badge>;
            case "event_based":
                return <Badge variant="outline">Event</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    const getLocationTypeBadge = (type: string) => {
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
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Volunteer Opportunities</h1>
                <p className="text-muted-foreground">Find meaningful ways to contribute to your community</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                </div>
            ) : roles.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {roles.map((role) => (
                        <Card key={role.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        {role.orgLogo ? (
                                            <img
                                                src={role.orgLogo}
                                                alt=""
                                                className="h-10 w-10 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-primary" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-medium">{role.orgName}</span>
                                                {role.orgVerified && (
                                                    <CheckCircle className="h-3.5 w-3.5 text-blue-500" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <CardTitle className="mt-3">{role.title}</CardTitle>
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
                                    onClick={() => handleApply(role.id)}
                                    disabled={applying === role.id}
                                >
                                    {applying === role.id ? (
                                        <Loader2 className="animate-spin h-4 w-4" />
                                    ) : (
                                        "Apply Now"
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="text-center py-12">
                        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No opportunities yet</h3>
                        <p className="text-muted-foreground">
                            Check back soon for new volunteer opportunities in your area.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
