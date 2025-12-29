import { PlatformHeader } from "@/components/platform/PlatformHeader";

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <PlatformHeader />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
                {children}
            </main>
        </div>
    );
}
