import type { Metadata } from "next";
import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AccessibilityProvider } from "@/components/providers/AccessibilityContext";
import { SkipToContent } from "@/components/SkipToContent";
import { AccessibilityScript } from "@/components/shared/AccessibilityScript";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Local Music Network",
    description: "Connect with Victorian musicians and buy/sell gear",
    icons: {
        icon: "/face-smile-regular-full.svg",
        shortcut: "/face-smile-regular-full.svg",
        apple: "/face-smile-regular-full.svg",
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Announcements feature disabled due to build issues

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
                            {/* <AnnouncementBanner announcements={[]} /> */}
                            {children}
                        </main>
                    </AccessibilityProvider>
                </Providers>
            </body>
        </html>
    );
}
