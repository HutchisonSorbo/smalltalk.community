import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "smalltalk.community",
    description: "Community Hub",
};

export default function HubLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main id="main-content" className="min-h-screen bg-background text-foreground font-sans antialiased">
            {children}
        </main>
    );
}
