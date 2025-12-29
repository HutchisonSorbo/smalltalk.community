import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { AccessibilityProvider } from "@/components/providers/AccessibilityContext";
import { SkipToContent } from "@/components/SkipToContent";
import { AccessibilityScript } from "@/components/shared/AccessibilityScript";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        template: "%s | smalltalk.community",
        default: "smalltalk.community",
    },
    description: "Your central launchpad for Victoria's creative tools, communities, and services.",
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
                        {children}
                        <SpeedInsights />
                    </AccessibilityProvider>
                </Providers>
            </body>
        </html>
    );
}
