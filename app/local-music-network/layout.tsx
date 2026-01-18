import type { Metadata } from "next";
import { PlatformHeader } from "@/components/platform/PlatformHeader";

export const metadata: Metadata = {
    title: "Local Music Network",
    description: "Connect with Victorian musicians and buy/sell gear",
    icons: {
        icon: "/icons/local-music-network.svg",
    },
};

export default function LocalMusicNetworkLayout({
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
