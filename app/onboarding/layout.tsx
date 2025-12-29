import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "@/app/providers";
import { AccessibilityProvider } from "@/components/providers/AccessibilityContext";
import { SkipToContent } from "@/components/SkipToContent";
import { AccessibilityScript } from "@/components/shared/AccessibilityScript";
import { PlatformHeader } from "@/components/platform/PlatformHeader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Onboarding | smalltalk.community",
    description: "Join the community",
    icons: {
        icon: "/face-smile-regular-full.svg",
        shortcut: "/face-smile-regular-full.svg",
        apple: "/face-smile-regular-full.svg",
    }
};

export default function OnboardingLayout({
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
                        <div className="min-h-screen bg-background flex flex-col">
                            <PlatformHeader />
                            <main id="main-content" className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
                                {children}
                            </main>
                        </div>
                    </AccessibilityProvider>
                </Providers>
            </body>
        </html>
    );
}
