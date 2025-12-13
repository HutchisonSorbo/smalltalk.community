import type { Metadata } from "next";
import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

import { AccessibilityProvider } from "@/components/providers/AccessibilityContext";
import { SkipToContent } from "@/components/SkipToContent";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "vic.band",
    // ... existing metadata ...
    description: "Connect with Victorian musicians and buy/sell gear",


};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    id="accessibility-script"
                    dangerouslySetInnerHTML={{
                        __html: `
                    (function() {
                        try {
                            var saved = localStorage.getItem("accessibility-settings");
                            if (saved) {
                                var s = JSON.parse(saved);
                                var h = document.documentElement;
                                if (s.highContrast) h.setAttribute("data-high-contrast", "true");
                                if (s.dyslexiaFont) h.setAttribute("data-dyslexia-font", "true");
                                h.setAttribute("data-text-scale", s.textScale || 1);
                                h.style.setProperty("--font-size-scale", s.textScale || 1);
                                h.setAttribute("data-line-spacing", s.lineSpacing || 1.5);
                                h.style.setProperty("--line-height-scale", s.lineSpacing || 1.5);
                                if (s.saturation) h.setAttribute("data-saturation", s.saturation);
                                if (s.linkHighlight) h.setAttribute("data-link-highlight", "true");
                            }
                        } catch (e) {}
                    })();
                    `
                    }}
                />
            </head>
            <body className={inter.className} suppressHydrationWarning>
                <Providers>
                    <AccessibilityProvider>
                        <SkipToContent />
                        <div id="main-content" className="min-h-screen bg-background text-foreground font-sans antialiased">
                            {children}
                        </div>
                    </AccessibilityProvider>
                </Providers>
            </body>
        </html>
    );
}
