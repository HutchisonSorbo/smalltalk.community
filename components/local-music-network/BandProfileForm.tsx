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
import { ImageUpload } from "@/components/Local Music Network/ImageUpload";
import { LocationAutocomplete } from "@/components/Local Music Network/LocationAutocomplete";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { genres, insertBandSchema } from "@shared/schema";
import { TagInput } from "@/components/ui/tag-input";
import type { Band } from "@shared/schema";

const formSchema = insertBandSchema.omit({ userId: true }).extend({
    name: z.string().min(2, "Name must be at least 2 characters"),
    bio: z.string().optional(),
    genres: z.array(z.string()).min(1, "Select at least one genre"),
    influences: z.array(z.string()).optional(),
    location: z.string().optional(),
    profileImageUrl: z.string().optional(),
    websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    socialLinks: z.object({
        facebook: z.string().optional(),
        instagram: z.string().optional(),
        snapchat: z.string().optional(),
        tiktok: z.string().optional(),
        youtube: z.string().optional(),
        spotify: z.string().optional(),
        soundcloud: z.string().optional(),
        appleMusic: z.string().optional(),
    }).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface BandProfileFormProps {
    band?: Band;
    onSuccess: () => void;
    onCancel: () => void;
}

export function BandProfileForm({ band, onSuccess, onCancel }: BandProfileFormProps) {
    const { toast } = useToast();
    // We don't really support editing yet in the plan, but good to have prepared logic
    const isEditing = !!band;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: band?.name || "",
            bio: band?.bio || "",
            genres: band?.genres || [],
            influences: band?.influences || [],
            location: band?.location || "",
            profileImageUrl: band?.profileImageUrl || "",
            websiteUrl: band?.websiteUrl || "",
            socialLinks: (band?.socialLinks as any) || {
                facebook: "",
                instagram: "",
                snapchat: "",
                tiktok: "",
                youtube: "",
                spotify: "",
                soundcloud: "",
                appleMusic: "",
            },
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: FormData) => {
            if (isEditing) {
                // Ensure backend supports PUT /api/bands/:id and checks permissions
                // Note: I haven't implemented PUT /api/bands/[id] yet in recent steps.
                // I need to implement it or use PATCH.
                // Looking at task.md: "PUT /api/bands/[id] (Update with RBAC check)" is unchecked.
                // I must implement the API route too.
                return apiRequest("PATCH", `/api/bands/${band.id}`, data);
            }
            return apiRequest("POST", "/api/bands", data);
        },
        onSuccess: () => {
            toast({
                title: "Band profile created",
                description: "Your band has been listed successfully.",
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
                    window.location.href = "/login";
                }, 500);
                return;
            }
            toast({
                title: "Error",
                description: "Failed to save band profile. Please try again.",
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
                            <FormLabel>Band Name *</FormLabel>
                            <FormControl>
                                <Input placeholder="Band Name" {...field} data-testid="input-band-name" />
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
                            <FormLabel>Band Photo</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value}
                                    onChange={field.onChange}
                                    label="Add Band Photo"
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
                                    placeholder="Tell us about the band..."
                                    className="min-h-[120px]"
                                    {...field}
                                    data-testid="input-band-bio"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <LocationAutocomplete
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        placeholder="Search suburbs or regions..."
                                        data-testid="input-location"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="websiteUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Website URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://..." {...field} data-testid="input-website" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

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
                    name="influences"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Influences</FormLabel>
                            <FormControl>
                                <TagInput
                                    placeholder="Enter musical influences (press Enter or comma)..."
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

                <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
                    <h3 className="font-semibold text-lg">Social & Music Links</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Connect with your fans and share your music.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <FormField
                            control={form.control}
                            name="socialLinks.facebook"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Facebook</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://facebook.com/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="socialLinks.instagram"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Instagram</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://instagram.com/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="socialLinks.tiktok"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>TikTok</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://tiktok.com/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="socialLinks.snapchat"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Snapchat</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://snapchat.com/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="socialLinks.youtube"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>YouTube</FormLabel>
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
                                    <FormLabel>Spotify</FormLabel>
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
                                    <FormLabel>SoundCloud</FormLabel>
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
                                    <FormLabel>Apple Music</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://music.apple.com/..." {...field} />
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
                    <Button type="submit" disabled={mutation.isPending} data-testid="button-save-band">
                        {mutation.isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Band Profile"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
