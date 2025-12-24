import Link from "next/link";
import { MapPin, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingBadge } from "@/components/Local Music Network/RatingBadge";
import type { MarketplaceListing } from "@shared/schema";

interface ListingCardProps {
  listing: MarketplaceListing;
}

export function ListingCard({ listing }: ListingCardProps) {
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

  return (
    <Link href={`/marketplace/${listing.id}`}>
      <Card className="hover-elevate cursor-pointer h-full transition-transform duration-200 overflow-hidden" data-testid={`card-listing-${listing.id}`}>
        <div className="aspect-[4/3] bg-muted relative">
          {listing.imageUrls && listing.imageUrls.length > 0 ? (
            <img
              src={listing.imageUrls[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary">
              {listing.category}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold line-clamp-2">{listing.title}</h3>
            <RatingBadge targetType="listing" targetId={listing.id} />
            <p className="text-xl font-bold text-primary">
              {formatPrice(listing.price, listing.priceType)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {listing.condition && (
              <Badge variant="outline">
                {listing.condition}
              </Badge>
            )}
            {listing.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{listing.location}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
