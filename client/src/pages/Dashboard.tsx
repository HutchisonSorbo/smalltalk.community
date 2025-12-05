import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Music, ShoppingBag, User, Edit, Trash2, Eye } from "lucide-react";
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
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MusicianProfileForm } from "@/components/MusicianProfileForm";
import { ListingForm } from "@/components/ListingForm";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { MusicianProfile, MarketplaceListing } from "@shared/schema";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  
  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  const initialTab = urlParams.get("tab") || "profile";
  const initialAction = urlParams.get("action");
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showProfileForm, setShowProfileForm] = useState(initialAction === "create");
  const [editingProfile, setEditingProfile] = useState<MusicianProfile | null>(null);
  const [showListingForm, setShowListingForm] = useState(false);
  const [editingListing, setEditingListing] = useState<MarketplaceListing | null>(null);
  const [deleteProfileId, setDeleteProfileId] = useState<string | null>(null);
  const [deleteListingId, setDeleteListingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to sign in to access the dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: myProfiles, isLoading: profilesLoading } = useQuery<MusicianProfile[]>({
    queryKey: ["/api/my/profiles"],
    enabled: isAuthenticated,
  });

  const { data: myListings, isLoading: listingsLoading } = useQuery<MarketplaceListing[]>({
    queryKey: ["/api/my/listings"],
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
          window.location.href = "/api/login";
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

  const deleteListingMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/marketplace/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace"] });
      toast({ title: "Listing deleted successfully" });
      setDeleteListingId(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive",
      });
    },
  });

  const handleProfileSuccess = () => {
    setShowProfileForm(false);
    setEditingProfile(null);
    queryClient.invalidateQueries({ queryKey: ["/api/my/profiles"] });
    queryClient.invalidateQueries({ queryKey: ["/api/musicians"] });
  };

  const handleListingSuccess = () => {
    setShowListingForm(false);
    setEditingListing(null);
    queryClient.invalidateQueries({ queryKey: ["/api/my/listings"] });
    queryClient.invalidateQueries({ queryKey: ["/api/marketplace"] });
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

  const formatPrice = (price: number | null) => {
    if (!price) return "Contact for price";
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
    }).format(price);
  };

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
                    <Music className="h-4 w-4 mr-2" />
                    Musician Profiles
                  </TabsTrigger>
                  <TabsTrigger value="listings" data-testid="tab-listings">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Marketplace Listings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  {showProfileForm || editingProfile ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {editingProfile ? "Edit Profile" : "Create Musician Profile"}
                        </CardTitle>
                        <CardDescription>
                          {editingProfile
                            ? "Update your musician profile information"
                            : "Create a profile to showcase your musical talents"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <MusicianProfileForm
                          profile={editingProfile || undefined}
                          onSuccess={handleProfileSuccess}
                          onCancel={() => {
                            setShowProfileForm(false);
                            setEditingProfile(null);
                          }}
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Your Profiles</h2>
                        <Button onClick={() => setShowProfileForm(true)} data-testid="button-create-profile">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Profile
                        </Button>
                      </div>

                      {profilesLoading ? (
                        <div className="grid gap-4">
                          {Array.from({ length: 2 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full" />
                          ))}
                        </div>
                      ) : myProfiles && myProfiles.length > 0 ? (
                        <div className="grid gap-4">
                          {myProfiles.map((profile) => (
                            <Card key={profile.id}>
                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  <Avatar className="h-16 w-16">
                                    <AvatarImage src={profile.profileImageUrl || undefined} alt={profile.name} className="object-cover" />
                                    <AvatarFallback>
                                      {profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                      <div>
                                        <h3 className="font-semibold text-lg">{profile.name}</h3>
                                        <p className="text-sm text-muted-foreground">{profile.location}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" asChild>
                                          <Link href={`/musicians/${profile.id}`} data-testid={`button-view-profile-${profile.id}`}>
                                            <Eye className="h-4 w-4" />
                                          </Link>
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setEditingProfile(profile)}
                                          data-testid={`button-edit-profile-${profile.id}`}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setDeleteProfileId(profile.id)}
                                          data-testid={`button-delete-profile-${profile.id}`}
                                        >
                                          <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {profile.instruments?.slice(0, 3).map((instrument) => (
                                        <Badge key={instrument} variant="outline" className="text-xs">
                                          {instrument}
                                        </Badge>
                                      ))}
                                      {profile.instruments && profile.instruments.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{profile.instruments.length - 3}
                                        </Badge>
                                      )}
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
                            <User className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No profiles yet</h3>
                            <p className="text-muted-foreground mb-4">
                              Create a musician profile to showcase your talents
                            </p>
                            <Button onClick={() => setShowProfileForm(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Create Your First Profile
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="listings" className="space-y-6">
                  {showListingForm || editingListing ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {editingListing ? "Edit Listing" : "Create Marketplace Listing"}
                        </CardTitle>
                        <CardDescription>
                          {editingListing
                            ? "Update your marketplace listing"
                            : "List equipment, services, or lessons for sale"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ListingForm
                          listing={editingListing || undefined}
                          onSuccess={handleListingSuccess}
                          onCancel={() => {
                            setShowListingForm(false);
                            setEditingListing(null);
                          }}
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Your Listings</h2>
                        <Button onClick={() => setShowListingForm(true)} data-testid="button-create-listing">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Listing
                        </Button>
                      </div>

                      {listingsLoading ? (
                        <div className="grid gap-4">
                          {Array.from({ length: 2 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full" />
                          ))}
                        </div>
                      ) : myListings && myListings.length > 0 ? (
                        <div className="grid gap-4">
                          {myListings.map((listing) => (
                            <Card key={listing.id}>
                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  <div className="w-24 h-24 rounded-md bg-muted overflow-hidden shrink-0">
                                    {listing.imageUrls && listing.imageUrls.length > 0 ? (
                                      <img
                                        src={listing.imageUrls[0]}
                                        alt={listing.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                      <div>
                                        <h3 className="font-semibold text-lg">{listing.title}</h3>
                                        <p className="text-xl font-bold text-primary">
                                          {formatPrice(listing.price)}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" asChild>
                                          <Link href={`/marketplace/${listing.id}`} data-testid={`button-view-listing-${listing.id}`}>
                                            <Eye className="h-4 w-4" />
                                          </Link>
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setEditingListing(listing)}
                                          data-testid={`button-edit-listing-${listing.id}`}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setDeleteListingId(listing.id)}
                                          data-testid={`button-delete-listing-${listing.id}`}
                                        >
                                          <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      <Badge variant="secondary" className="text-xs">{listing.category}</Badge>
                                      {listing.condition && (
                                        <Badge variant="outline" className="text-xs">{listing.condition}</Badge>
                                      )}
                                      {listing.location && (
                                        <span className="text-sm text-muted-foreground">{listing.location}</span>
                                      )}
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
                            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                            <p className="text-muted-foreground mb-4">
                              List your equipment, services, or lessons for sale
                            </p>
                            <Button onClick={() => setShowListingForm(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Create Your First Listing
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </>
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

      <AlertDialog open={!!deleteListingId} onOpenChange={() => setDeleteListingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this marketplace listing? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteListingId && deleteListingMutation.mutate(deleteListingId)}
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
