import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Mail, Phone, Package, Calendar, User, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ReviewSection } from "@/components/ReviewSection";
import { StarRating } from "@/components/StarRating";
import { useAuth } from "@/hooks/useAuth";
import type { MarketplaceListing, User as UserType } from "@shared/schema";

interface ListingWithSeller extends MarketplaceListing {
  seller?: UserType;
}

export default function ListingDetail() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.id as string;
  const { user, isAuthenticated } = useAuth();

  const { data: listing, isLoading } = useQuery<ListingWithSeller>({
    queryKey: ["/api/marketplace", listingId],
    enabled: !!listingId,
  });

  const { data: ratingData } = useQuery<{ average: number; count: number }>({
    queryKey: ["/api/reviews/target", "listing", listingId, "rating"],
    enabled: !!listingId,
  });

  const canMessage = isAuthenticated && listing?.userId && user?.id !== listing.userId;

  const formatPrice = (price: number | null, priceType: string | null) => {
    if (!price) return "Contact for price";
    const formatted = new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
    }).format(price);
    if (priceType === "negotiable") return `${formatted} (Negotiable)`;
    if (priceType === "free") return "Free";
    return formatted;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showSearch={false} />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <Skeleton className="h-8 w-32" />
            <div className="grid md:grid-cols-[1fr_320px] gap-8">
              <div className="space-y-4">
                <Skeleton className="aspect-[16/9] w-full rounded-lg" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-32 w-full" />
              </div>
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showSearch={false} />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The listing you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/marketplace">Back to Marketplace</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header showSearch={false} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <Button variant="ghost" asChild className="mb-6" data-testid="button-back">
              <Link href="/marketplace">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Marketplace
              </Link>
            </Button>

            <div className="grid lg:grid-cols-[1fr_320px] gap-8">
              <div className="space-y-6">
                <div className="aspect-[16/9] bg-muted rounded-lg overflow-hidden">
                  {listing.imageUrls && listing.imageUrls.length > 0 ? (
                    <img
                      src={listing.imageUrls[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                {listing.imageUrls && listing.imageUrls.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {listing.imageUrls.slice(1).map((url, idx) => (
                      <div key={idx} className="w-24 h-24 shrink-0 rounded-md overflow-hidden bg-muted">
                        <img
                          src={url}
                          alt={`${listing.title} - Image ${idx + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{listing.category}</Badge>
                    {listing.condition && (
                      <Badge variant="outline">{listing.condition}</Badge>
                    )}
                  </div>

                  <h1 className="text-3xl font-bold" data-testid="text-listing-title">
                    {listing.title}
                  </h1>

                  {ratingData && ratingData.count > 0 && (
                    <div className="flex items-center gap-2" data-testid="listing-rating">
                      <StarRating rating={ratingData.average} size="sm" />
                      <span className="text-sm text-muted-foreground">
                        ({ratingData.count} {ratingData.count === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  )}

                  <p className="text-3xl font-bold text-primary" data-testid="text-listing-price">
                    {formatPrice(listing.price, listing.priceType)}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {listing.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{listing.location}</span>
                      </div>
                    )}
                    {listing.createdAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Posted {formatDate(listing.createdAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h2 className="text-lg font-semibold mb-3">Description</h2>
                  <div className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground">
                    {listing.description ? (
                      <p className="whitespace-pre-wrap">{listing.description}</p>
                    ) : (
                      <p className="italic">No description provided.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:sticky lg:top-20 h-fit">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Contact Seller
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {listing.seller && (
                      <div className="flex items-center gap-3 pb-4 border-b">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {listing.seller.firstName} {listing.seller.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">Seller</p>
                        </div>
                      </div>
                    )}

                    {canMessage && (
                      <Button
                        className="w-full"
                        onClick={() => router.push(`/messages/${listing.userId}`)}
                        data-testid="button-send-message"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    )}

                    {listing.contactEmail && (
                      <Button asChild variant={canMessage ? "outline" : "default"} className="w-full" data-testid="button-email-seller">
                        <a href={`mailto:${listing.contactEmail}?subject=Inquiry: ${listing.title}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          Email Seller
                        </a>
                      </Button>
                    )}

                    {listing.contactPhone && (
                      <Button variant="outline" asChild className="w-full" data-testid="button-call-seller">
                        <a href={`tel:${listing.contactPhone}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          {listing.contactPhone}
                        </a>
                      </Button>
                    )}

                    {!listing.contactEmail && !listing.contactPhone && !canMessage && (
                      <p className="text-muted-foreground text-sm text-center py-4">
                        No contact information provided.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-8">
              <ReviewSection
                targetType="listing"
                targetId={listing.id}
                currentUser={user}
                ownerId={listing.userId}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
