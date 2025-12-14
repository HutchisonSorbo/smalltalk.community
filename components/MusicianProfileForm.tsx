import { useForm } from "react-hook-form";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ImageUpload";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { TagInput } from "@/components/ui/tag-input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { instruments, genres, experienceLevels, availabilityOptions, insertMusicianProfileSchema } from "@shared/schema";
import type { MusicianProfile } from "@shared/schema";

const formSchema = insertMusicianProfileSchema.omit({ userId: true }).extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  instruments: z.array(z.string()).min(1, "Select at least one instrument"),
  genres: z.array(z.string()).min(1, "Select at least one genre"),
  experienceLevel: z.string().optional(),
  availability: z.string().optional(),
  location: z.string().optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  isContactInfoPublic: z.boolean().default(false),
  profileImageUrl: z.string().optional(),
  isLookingForGroup: z.boolean().default(false),
  isLocationShared: z.boolean().default(false),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  // New fields
  socialLinks: z.object({
    youtube: z.string().optional(),
    spotify: z.string().optional(),
    soundcloud: z.string().optional(),
    appleMusic: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
  influences: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof formSchema>;

interface MusicianProfileFormProps {
  profile?: MusicianProfile;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MusicianProfileForm({ profile, onSuccess, onCancel }: MusicianProfileFormProps) {
  const { toast } = useToast();
  const isEditing = !!profile;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile?.name || "",
      bio: profile?.bio || "",
      instruments: profile?.instruments || [],
      genres: profile?.genres || [],
      experienceLevel: profile?.experienceLevel || "",
      availability: profile?.availability || "",
      location: profile?.location || "",
      contactEmail: profile?.contactEmail || "",
      contactPhone: profile?.contactPhone || "",
      isContactInfoPublic: profile?.isContactInfoPublic ?? false,
      profileImageUrl: profile?.profileImageUrl || "",
      isLookingForGroup: profile?.isLookingForGroup ?? false,
      isLocationShared: profile?.isLocationShared ?? false,
      latitude: profile?.latitude || "",
      longitude: profile?.longitude || "",
      socialLinks: (profile?.socialLinks as any) || {
        youtube: "",
        spotify: "",
        soundcloud: "",
        instagram: "",
        website: "",
      },
      influences: profile?.influences || [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditing) {
        return apiRequest("PUT", `/api/musicians/${profile.id}`, data);
      }
      return apiRequest("POST", "/api/musicians", data);
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Profile updated" : "Profile created",
        description: isEditing
          ? "Your musician profile has been updated successfully."
          : "Your musician profile has been created successfully.",
      });
      onSuccess();
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
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log("Form submitted with data:", data);

    // Geocode if location sharing is enabled, location is present, AND coords are missing
    // If we have coords from local DB (via Autocomplete), we skip this.
    if (data.isLocationShared && data.location && (!data.latitude || !data.longitude)) {
      console.log("Coordinates missing, attempting geocode for:", data.location);

      // Try local lookup first
      const { searchLocations } = await import("@/lib/victoriaLocations");
      const localResults = searchLocations(data.location, 1);

      if (localResults.length > 0 && localResults[0].latitude && localResults[0].longitude) {
        data.latitude = localResults[0].latitude;
        data.longitude = localResults[0].longitude;
        console.log("Found coordinates locally:", data.latitude, data.longitude);
      } else {
        // Fallback to external API
        try {
          const query = encodeURIComponent(`${data.location}, Victoria, Australia`);
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
          if (res.ok) {
            const results = await res.json();
            if (results && results.length > 0) {
              data.latitude = results[0].lat;
              data.longitude = results[0].lon;
              console.log("Geocoded:", data.location, data.latitude, data.longitude);
            } else {
              toast({
                title: "Location not found",
                description: `Could not find coordinates for "${data.location}". Your pin may not appear on the map.`,
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error("Geocoding failed:", error);
          toast({
            title: "Geocoding failed",
            description: "There was an error finding your location on the map.",
            variant: "destructive",
          });
        }
      }
    } else {
      // If location is NOT shared, clear coords (safety)
      if (!data.isLocationShared) {
        data.latitude = "";
        data.longitude = "";
      }
    }

    mutation.mutate(data);
  };

  const handleFormError = () => {
    console.log("Form errors:", form.formState.errors);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, handleFormError)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input placeholder="Your name or stage name" {...field} data-testid="input-profile-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="profileImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Photo</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  label="Add Photo"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself and your musical journey..."
                  className="min-h-[120px]"
                  {...field}
                  data-testid="input-profile-bio"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="experienceLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-experience">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Suburb</FormLabel>
                <FormControl>
                  <LocationAutocomplete
                    value={field.value || ""}
                    onChange={field.onChange}
                    onLocationSelect={(loc) => {
                      if (loc.latitude && loc.longitude) {
                        form.setValue("latitude", loc.latitude);
                        form.setValue("longitude", loc.longitude);
                        console.log("Set coordinates from local DB:", loc.latitude, loc.longitude);
                      } else {
                        // Clear coords if not found locally, to force re-geocode or clear
                        form.setValue("latitude", "");
                        form.setValue("longitude", "");
                      }
                    }}
                    placeholder="Search suburbs..."
                    data-testid="input-location"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isLocationShared"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Share suburb on map
                  </FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Show my suburb on the homepage map (approximate location only).
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-share-location"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="instruments"
          render={() => (
            <FormItem>
              <FormLabel>Instruments *</FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {instruments.map((instrument) => (
                  <FormField
                    key={instrument}
                    control={form.control}
                    name="instruments"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(instrument)}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, instrument]);
                              } else {
                                field.onChange(current.filter((v) => v !== instrument));
                              }
                            }}
                            data-testid={`checkbox-instrument-${instrument.toLowerCase().replace(/\s+/g, "-")}`}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          {instrument}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="genres"
          render={() => (
            <FormItem>
              <FormLabel>Genres *</FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {genres.map((genre) => (
                  <FormField
                    key={genre}
                    control={form.control}
                    name="genres"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(genre)}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, genre]);
                              } else {
                                field.onChange(current.filter((v) => v !== genre));
                              }
                            }}
                            data-testid={`checkbox-genre-${genre.toLowerCase().replace(/\s+/g, "-")}`}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          {genre}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isLookingForGroup"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="checkbox-lfg"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Looking For Group
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Highlight your profile to show you are looking for a band or gig opportunities.
                </p>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="availability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Availability</FormLabel>
              <Select
                value={field.value || ""}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger data-testid="select-availability">
                    <SelectValue placeholder="Select your availability" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availabilityOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
          <h3 className="font-semibold text-lg">Music Links</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add links to your music profiles.
          </p>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="socialLinks.youtube"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socialLinks.spotify"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spotify URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://open.spotify.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socialLinks.soundcloud"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SoundCloud URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://soundcloud.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socialLinks.appleMusic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apple Music URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://music.apple.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="influences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Influences</FormLabel>
              <FormControl>
                <TagInput
                  placeholder="Enter your musical influences (press Enter or comma)..."
                  value={field.value || []}
                  onChange={field.onChange}
                />
              </FormControl>
              <div className="text-sm text-muted-foreground mt-1">
                Press Enter or Comma to add an influence.
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="isContactInfoPublic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Public Contact Info
                  </FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Allow anyone to see your contact details. If unchecked, users must request access.
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-public-contact"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      {...field}
                      data-testid="input-contact-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="0400 000 000"
                      {...field}
                      data-testid="input-contact-phone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
            Cancel
          </Button>
          {isEditing && profile?.id && (
            <Button type="button" variant="secondary" asChild data-testid="button-view-profile">
              <Link href={`/musicians/${profile.id}`}>View Profile</Link>
            </Button>
          )}
          <Button type="submit" disabled={mutation.isPending} data-testid="button-save-profile">
            {mutation.isPending ? "Saving..." : isEditing ? "Update Profile" : "Create Profile"}
          </Button>
        </div>
      </form >
    </Form >
  );
}
