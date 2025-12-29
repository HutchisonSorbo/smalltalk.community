import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/local-music-network/globals.css";
import { Providers } from "@/app/local-music-network/providers";
import { AccessibilityProvider } from "@/components/providers/AccessibilityContext";
import { SkipToContent } from "@/components/SkipToContent";
import { AccessibilityScript } from "@/components/shared/AccessibilityScript";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "smalltalk.community",
    description: "Community Hub",
    icons: {
        icon: "/face-smile-regular-full.svg",
        shortcut: "/face-smile-regular-full.svg",
        apple: "/face-smile-regular-full.svg",
    }
};

export default function HubLayout({
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
                            {children}
                        </main>
                    </AccessibilityProvider>
                </Providers>
            </body>
        </html>
    );
}

// CodeRabbit Audit Trigger
