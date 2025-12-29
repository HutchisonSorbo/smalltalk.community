import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  showValue = false,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: number) => {
    if (interactive && onRatingChange && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => {
          const value = i + 1;
          const isFilled = value <= rating;
          const isHalf = value > rating && value - 0.5 <= rating;

          return (
            <button
              key={value}
              type="button"
              onClick={() => handleClick(value)}
              onKeyDown={(e) => handleKeyDown(e, value)}
              disabled={!interactive}
              className={cn(
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm",
                interactive && "cursor-pointer hover:scale-110 transition-transform"
              )}
              tabIndex={interactive ? 0 : -1}
              aria-label={interactive ? `Rate ${value} out of ${maxRating}` : undefined}
              data-testid={interactive ? `star-rating-${value}` : undefined}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : isHalf
                    ? "fill-yellow-400/50 text-yellow-400"
                    : "fill-transparent text-muted-foreground"
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-muted-foreground ml-1" data-testid="text-rating-value">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// CodeRabbit Audit Trigger
