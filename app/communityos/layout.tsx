/**
 * CommunityOS Root Layout
 * Provides shared structure for all CommunityOS pages
 */

import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        template: "%s | CommunityOS",
        default: "CommunityOS",
    },
    description: "Empowering community organisations with digital tools",
};

export default function CommunityOSLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Suspense
                fallback={
                    <div className="flex min-h-screen items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                }
            >
                {children}
            </Suspense>
        </div>
    );
}
