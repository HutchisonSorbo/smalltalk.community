import type { Metadata } from "next";
import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { db } from "@/server/db";
import { announcements } from "@shared/schema";
import { desc, eq } from "drizzle-orm";
import { AnnouncementBanner } from "@/components/local-music-network/AnnouncementBanner";

import { AccessibilityProvider } from "@/components/providers/AccessibilityContext";
import { SkipToContent } from "@/components/SkipToContent";
// import Script from "next/script"; // Removed as we use shared component
import { AccessibilityScript } from "@/components/shared/AccessibilityScript";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Local Music Network",
    description: "Connect with Victorian musicians and buy/sell gear",
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/favicon.ico",
    }
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    let activeAnnouncements = [];
    try {
        activeAnnouncements = await db
            .select()
            .from(announcements)
            .where(eq(announcements.isActive, true))
            .orderBy(desc(announcements.priority), desc(announcements.createdAt));
    } catch (error) {
        console.error("Failed to fetch announcements:", error);
        // Fallback to empty announcements to prevent build failure
    }

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <AccessibilityScript />
            </head>
            <body className={inter.className} suppressHydrationWarning>
                <Providers>
                    <AccessibilityProvider>
                        <SkipToContent />
                        <main id="main-content" className="min-h-screen bg-background text-foreground font-sans antialiased">
                            <AnnouncementBanner announcements={activeAnnouncements} />
                            {children}
                        </main>
                    </AccessibilityProvider>
                </Providers>
            </body>
        </html>
    );
}
