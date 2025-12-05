import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiImageUpload } from "@/components/ImageUpload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { marketplaceCategories, itemConditions, victoriaRegions, insertMarketplaceListingSchema } from "@shared/schema";
import type { MarketplaceListing } from "@shared/schema";

const formSchema = insertMarketplaceListingSchema.omit({ userId: true }).extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Please select a category"),
  condition: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive").optional().or(z.literal("")),
  priceType: z.string().optional(),
  location: z.string().optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ListingFormProps {
  listing?: MarketplaceListing;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ListingForm({ listing, onSuccess, onCancel }: ListingFormProps) {
  const { toast } = useToast();
  const isEditing = !!listing;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: listing?.title || "",
      description: listing?.description || "",
      category: listing?.category || "",
      condition: listing?.condition || "",
      price: listing?.price || undefined,
      priceType: listing?.priceType || "fixed",
      location: listing?.location || "",
      contactEmail: listing?.contactEmail || "",
      contactPhone: listing?.contactPhone || "",
      imageUrls: listing?.imageUrls || [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        price: data.price === "" ? null : data.price,
      };
      if (isEditing) {
        return apiRequest("PUT", `/api/marketplace/${listing.id}`, payload);
      }
      return apiRequest("POST", "/api/marketplace", payload);
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Listing updated" : "Listing created",
        description: isEditing
          ? "Your listing has been updated successfully."
          : "Your listing has been created successfully.",
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
        description: "Failed to save listing. Please try again.",
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Fender Stratocaster 2020" {...field} data-testid="input-listing-title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrls"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photos</FormLabel>
              <FormControl>
                <MultiImageUpload
                  value={field.value || []}
                  onChange={field.onChange}
                  maxImages={5}
                  label="Add Photos"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your item, service, or lesson in detail..."
                  className="min-h-[120px]"
                  {...field}
                  data-testid="input-listing-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {marketplaceCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
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
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-condition">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {itemConditions.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (AUD)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    value={field.value ?? ""}
                    data-testid="input-price"
                  />
                </FormControl>
                <FormDescription>Leave empty for "Contact for price"</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || "fixed"}>
                  <FormControl>
                    <SelectTrigger data-testid="select-price-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="negotiable">Negotiable</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-listing-location">
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
                    data-testid="input-listing-email"
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
                    data-testid="input-listing-phone"
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
          <Button type="submit" disabled={mutation.isPending} data-testid="button-save-listing">
            {mutation.isPending ? "Saving..." : isEditing ? "Update Listing" : "Create Listing"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
