import type { Metadata } from "next";
import { PlatformHeader } from "@/components/platform/PlatformHeader";

export const metadata: Metadata = {
    title: "Apps | smalltalk.community",
    description: "App Catalogue",
};

export default function AppsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <PlatformHeader />
            <main id="main-content" className="min-h-screen bg-background text-foreground font-sans antialiased">
                {children}
            </main>
        </>
    );
}
