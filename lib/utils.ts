import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates that a URL uses a safe protocol (http or https).
 * Returns the URL if safe, otherwise returns undefined.
 */
export function safeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  // Use explicit regex for protocol validation to satisfy SAST tools
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return undefined;
}

// CodeRabbit Audit Trigger
