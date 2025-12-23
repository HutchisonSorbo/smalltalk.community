import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/vic-band/globals.css";
import { Providers } from "@/app/vic-band/providers";
import { AccessibilityProvider } from "@/components/providers/AccessibilityContext";
import { SkipToContent } from "@/components/SkipToContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Smalltalk Community",
    description: "Community Hub",
};

export default function HubLayout({
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
                         <main id="main-content" className="min-h-screen bg-background text-foreground font-sans antialiased">
                            {children}
                        </main>
                    </AccessibilityProvider>
                </Providers>
            </body>
        </html>
    );
}
