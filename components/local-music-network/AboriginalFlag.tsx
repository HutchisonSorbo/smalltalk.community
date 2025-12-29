import { cn } from "@/lib/utils";

interface FlagProps {
    className?: string;
}

export function AboriginalFlag({ className }: FlagProps) {
    return (
        <svg
            viewBox="0 0 300 200"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("inline-block", className)}
            role="img"
            aria-label="Aboriginal Flag"
        >
            <rect width="300" height="100" fill="#000000" />
            <rect y="100" width="300" height="100" fill="#ff0000" />
            <circle cx="150" cy="100" r="60" fill="#ffcc00" />
        </svg>
    );
}

// CodeRabbit Audit Trigger
