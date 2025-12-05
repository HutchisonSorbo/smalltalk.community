import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { instruments, genres, experienceLevels, victoriaRegions, insertMusicianProfileSchema } from "@shared/schema";
import type { MusicianProfile } from "@shared/schema";

const formSchema = insertMusicianProfileSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  instruments: z.array(z.string()).min(1, "Select at least one instrument"),
  genres: z.array(z.string()).min(1, "Select at least one genre"),
  experienceLevel: z.string().optional(),
  availability: z.string().optional(),
  location: z.string().optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  profileImageUrl: z.string().optional(),
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
      profileImageUrl: profile?.profileImageUrl || "",
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

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <FormLabel>Location</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-location">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {victoriaRegions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
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
          name="availability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Availability</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Weekends, Evenings, Full-time"
                  {...field}
                  data-testid="input-availability"
                />
              </FormControl>
              <FormMessage />
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

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending} data-testid="button-save-profile">
            {mutation.isPending ? "Saving..." : isEditing ? "Update Profile" : "Create Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
