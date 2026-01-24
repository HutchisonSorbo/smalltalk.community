import type { Metadata } from "next";
import { VolunteerHeader } from "@/components/volunteer-passport/Header";

export const metadata: Metadata = {
    title: "Volunteer Passport | Smalltalk Community",
    description: "Your digital passport for volunteering in Victoria",
    icons: {
        icon: "/icons/volunteer-passport.svg",
    },
};

export default function VolunteerPassportLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main id="main-content" className="min-h-screen bg-background text-foreground font-sans antialiased">
            <VolunteerHeader />
            <div className="container mx-auto py-6">
                {children}
            </div>
        </main>
    );
}
