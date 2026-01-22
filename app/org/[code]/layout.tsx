/**
 * Public Organisation Profile Layout
 * Minimal layout for public-facing profile pages (no auth required)
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        template: "%s | smalltalk.community",
        default: "Organisation Profile | smalltalk.community",
    },
};

interface OrgLayoutProps {
    children: React.ReactNode;
}

export default function OrgLayout({ children }: OrgLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {children}
        </div>
    );
}
