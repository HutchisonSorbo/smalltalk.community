import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "smalltalk.community",
    description: "Join your local music community",
};

export default function LoginLayout({
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
