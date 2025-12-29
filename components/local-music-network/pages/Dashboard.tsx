"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Users, Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Header } from "@/components/local-music-network/Header";
import { Footer } from "@/components/local-music-network/Footer";
import { MusicianProfileForm } from "@/components/local-music-network/MusicianProfileForm";
import { ProfessionalDashboardContent } from "@/components/local-music-network/dashboard/ProfessionalDashboardContent";
import { BandList } from "@/components/local-music-network/dashboard/BandList";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { MusicianProfile, Band } from "@shared/schema";

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
                  <BandList bands={myBands} isLoading={bandsLoading} />
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

// CodeRabbit Audit Trigger
