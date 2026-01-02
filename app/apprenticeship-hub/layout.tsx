import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Apprenticeship & Traineeship Hub | smalltalk.community",
    description: "Discover apprenticeships, traineeships, and career pathways across Victoria",
};

export default function ApprenticeshipHubLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="bg-accent border-t border-secondary p-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                        Part of the{" "}
                        <a href="/" className="text-primary hover:underline font-medium">
                            smalltalk.community
                        </a>{" "}
                        network
                    </p>
                    <p className="text-xs text-muted-foreground">
                        © 2025 smalltalk.community
                    </p>
                </div>
            </footer>
        </div>
    );
}
