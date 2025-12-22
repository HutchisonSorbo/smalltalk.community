"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ProfessionalProfileForm } from "@/components/vic-band/ProfessionalProfileForm";
import { Plus, Music, User, Users, MapPin, Globe, Briefcase } from "lucide-react"; // Added Users, Briefcase
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Header } from "@/components/vic-band/Header";
import { Footer } from "@/components/vic-band/Footer";
import { MusicianProfileForm } from "@/components/MusicianProfileForm";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { MusicianProfile, Band, ProfessionalProfile } from "@shared/schema"; // Changed MarketplaceListing to Band

function ProfessionalDashboardContent({ user }: { user: any }) {
  const { data: myProfile, isLoading } = useQuery<ProfessionalProfile>({
    queryKey: ["professional-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await fetch(`/api/professionals?userId=${user.id}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {myProfile ? "Edit Professional Profile" : "Create Professional Profile"}
        </CardTitle>
        <CardDescription>
          {myProfile
            ? "Update your business information and services"
            : "List your services in the industry directory to be discovered"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProfessionalProfileForm
          profile={myProfile}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["professional-profile"] });
            queryClient.invalidateQueries({ queryKey: ["/api/professionals"] });
          }}
        />
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab") || "profile";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [deleteProfileId, setDeleteProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to sign in to access the dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: myProfiles, isLoading: profilesLoading } = useQuery<MusicianProfile[]>({
    queryKey: ["/api/my/profiles"],
    enabled: isAuthenticated,
  });

  // Replaced Listings with Bands
  const { data: myBands, isLoading: bandsLoading } = useQuery<Band[]>({
    queryKey: ["/api/my/bands"],
    enabled: isAuthenticated,
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/musicians/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/musicians"] });
      toast({ title: "Profile deleted successfully" });
      setDeleteProfileId(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete profile",
        variant: "destructive",
      });
    },
  });

  const handleProfileSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/my/profiles"] });
    queryClient.invalidateQueries({ queryKey: ["/api/musicians"] });
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    toast({ title: myProfiles && myProfiles.length > 0 ? "Profile updated" : "Profile created" });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showSearch={false} />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header showSearch={false} />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} className="object-cover" />
                <AvatarFallback className="text-xl">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {user?.firstName ? `${user.firstName}'s Dashboard` : "Dashboard"}
                </h1>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="profile" data-testid="tab-profile">
                    {user?.userType === 'professional' ? <Briefcase className="h-4 w-4 mr-2" /> : <User className="h-4 w-4 mr-2" />}
                    {user?.userType === 'professional' ? "Professional Profile" : "Musician Profile"}
                  </TabsTrigger>
                  <TabsTrigger value="bands" data-testid="tab-bands">
                    <Users className="h-4 w-4 mr-2" />
                    My Bands
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  {profilesLoading && user?.userType !== 'professional' ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-48" />
                      <Skeleton className="h-96 w-full" />
                    </div>
                  ) : user?.userType === 'professional' ? (
                    <ProfessionalDashboardContent user={user} />
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {myProfiles && myProfiles.length > 0 ? "Edit Your Profile" : "Create Your Profile"}
                        </CardTitle>
                        <CardDescription>
                          {myProfiles && myProfiles.length > 0
                            ? "Update your musician profile information visible to others"
                            : "Create your profile to showcase your musical talents"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <MusicianProfileForm
                          profile={myProfiles && myProfiles.length > 0 ? myProfiles[0] : undefined}
                          onSuccess={handleProfileSuccess}
                          onCancel={() => { }}
                        />
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="bands" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Your Band Profiles</h2>
                    <Button asChild data-testid="button-register-band">
                      <Link href="/bands/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Register Band
                      </Link>
                    </Button>
                  </div>

                  {bandsLoading ? (
                    <div className="grid gap-4">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </div>
                  ) : myBands && myBands.length > 0 ? (
                    <div className="grid gap-4">
                      {myBands.map((band) => (
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
                                  <h3 className="font-semibold text-lg">{band.name}</h3>
                                  {/* Edit/Delete functionality not fully implemented in API yet, so just display info */}
                                </div>
                                <div className="space-y-1 mt-1">
                                  {band.location && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <MapPin className="h-3.5 w-3.5" />
                                      {band.location}
                                    </div>
                                  )}
                                  {band.websiteUrl && (
                                    <div className="flex items-center gap-1 text-sm text-primary">
                                      <Globe className="h-3.5 w-3.5" />
                                      <a href={band.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {band.websiteUrl}
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
                  ) : (
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
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <AlertDialog open={!!deleteProfileId} onOpenChange={() => setDeleteProfileId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this musician profile? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProfileId && deleteProfileMutation.mutate(deleteProfileId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
