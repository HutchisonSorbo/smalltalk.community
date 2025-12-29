import type { Metadata } from "next";
import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/local-music-network/providers";
import { AccessibilityProvider } from "@/components/providers/AccessibilityContext";
import { SkipToContent } from "@/components/SkipToContent";
import { AccessibilityScript } from "@/components/shared/AccessibilityScript";
import { VolunteerHeader } from "@/components/volunteer-passport/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Volunteer Passport | Smalltalk Community",
    description: "Your digital passport for volunteering in Victoria",
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
                            <VolunteerHeader />
                            <div className="container mx-auto py-6">
                                {children}
                            </div>
                        </main>
                    </AccessibilityProvider>
                </Providers>
            </body>
        </html>
    );
}

// CodeRabbit Audit Trigger
