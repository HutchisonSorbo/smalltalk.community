import type { Metadata } from "next";
import { PlatformHeader } from "@/components/platform/PlatformHeader";

export const metadata: Metadata = {
    title: "Dashboard | smalltalk.community",
    description: "Your Hub",
};

export default function DashboardLayout({
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
