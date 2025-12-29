
import Image from "next/image";

export interface LogoProps {
    className?: string;
    text?: string;
    ariaLabel?: string;
}

export function Logo({ className, text = "Local Music Network", ariaLabel }: Readonly<LogoProps>) {
    return (
        <Image
            src="/logo.png"
            alt={ariaLabel || `${text} Logo`}
            width={32}
            height={32}
            priority
            className={`h-8 w-auto ${className}`}
        />
    );
}

// CodeRabbit Audit Trigger
