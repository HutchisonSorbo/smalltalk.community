"use client";

import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface RatingBadgeProps {
  targetType: "musician" | "listing";
  targetId: string;
}

interface RatingResponse {
  average: number;
  count: number;
}

export function RatingBadge({ targetType, targetId }: RatingBadgeProps) {
  const { data } = useQuery<RatingResponse>({
    queryKey: ["/api/reviews", targetType, targetId, "rating"],
  });

  if (!data || data.count === 0) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-1 text-sm"
      data-testid={`rating-badge-${targetType}-${targetId}`}
    >
      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
      <span className="font-medium">{data.average.toFixed(1)}</span>
      <span className="text-muted-foreground">({data.count})</span>
    </div>
  );
}
