import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/local-music-network/StarRating";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ReviewWithReviewer, User } from "@shared/schema";

interface ReviewSectionProps {
  targetType: "musician" | "listing";
  targetId: string;
  currentUser?: User | null;
  ownerId?: string;
}

interface ReviewsResponse {
  reviews: ReviewWithReviewer[];
  average: number;
  count: number;
}

export function ReviewSection({ targetType, targetId, currentUser, ownerId }: ReviewSectionProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: reviewsData, isLoading } = useQuery<ReviewsResponse>({
    queryKey: ["/api/reviews", targetType, targetId],
  });

  const { data: hasReviewedData } = useQuery<{ hasReviewed: boolean }>({
    queryKey: ["/api/reviews", targetType, targetId, "check"],
    enabled: !!currentUser,
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: { targetType: string; targetId: string; rating: number; comment: string }) => {
      return apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", targetType, targetId] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", targetType, targetId, "check"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", targetType, targetId, "rating"] });
      setRating(0);
      setComment("");
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return apiRequest("DELETE", `/api/reviews/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", targetType, targetId] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", targetType, targetId, "check"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", targetType, targetId, "rating"] });
      toast({
        title: "Review deleted",
        description: "Your review has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createReviewMutation.mutateAsync({
        targetType,
        targetId,
        rating,
        comment: comment.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    await deleteReviewMutation.mutateAsync(reviewId);
  };

  const canReview = currentUser && !hasReviewedData?.hasReviewed && currentUser.id !== ownerId;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const reviews = reviewsData?.reviews || [];
  const average = reviewsData?.average || 0;
  const count = reviewsData?.count || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Reviews
          </CardTitle>
          {count > 0 && (
            <div className="flex items-center gap-2" data-testid="review-summary">
              <StarRating rating={average} size="sm" />
              <span className="text-sm text-muted-foreground" data-testid="text-review-count">
                ({count} {count === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {canReview && (
          <div className="space-y-4 pb-6 border-b" data-testid="review-form">
            <div>
              <p className="text-sm font-medium mb-2">Your Rating</p>
              <StarRating
                rating={rating}
                interactive
                onRatingChange={setRating}
                size="lg"
              />
            </div>
            <div>
              <Textarea
                placeholder="Write your review (optional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                data-testid="input-review-comment"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              data-testid="button-submit-review"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        )}

        {!currentUser && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Sign in to leave a review
          </p>
        )}

        {currentUser && hasReviewedData?.hasReviewed && (
          <p className="text-sm text-muted-foreground text-center py-2">
            You have already reviewed this
          </p>
        )}

        {currentUser && currentUser.id === ownerId && (
          <p className="text-sm text-muted-foreground text-center py-2">
            You cannot review your own {targetType === "musician" ? "profile" : "listing"}
          </p>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-no-reviews">
            No reviews yet. Be the first to leave a review!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex gap-3"
                data-testid={`review-item-${review.id}`}
              >
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage
                    src={review.reviewer?.profileImageUrl || undefined}
                    alt={review.reviewer?.firstName || "User"}
                  />
                  <AvatarFallback>
                    {(review.reviewer?.firstName?.[0] || "") +
                      (review.reviewer?.lastName?.[0] || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium" data-testid={`text-reviewer-name-${review.id}`}>
                        {review.reviewer?.firstName} {review.reviewer?.lastName}
                      </span>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {review.createdAt &&
                          formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                      {currentUser?.id === review.reviewerId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(review.id)}
                          disabled={deleteReviewMutation.isPending}
                          className="text-destructive"
                          data-testid={`button-delete-review-${review.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="mt-1 text-sm text-muted-foreground" data-testid={`text-review-comment-${review.id}`}>
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// CodeRabbit Audit Trigger
