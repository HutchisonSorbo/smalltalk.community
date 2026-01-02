export default function PeerSupportFinderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1">{children}</main>

            {/* Privacy-focused Footer */}
            <footer className="bg-accent border-t border-secondary p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Privacy Notice */}
                    <div className="bg-background border border-secondary rounded-lg p-4 mb-4">
                        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            🔒 Your Privacy
                        </h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• No login or account required</li>
                            <li>• We don&apos;t track your searches</li>
                            <li>• Your location is never stored</li>
                        </ul>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                        © 2025 smalltalk.community
                    </p>
                </div>
            </footer>
        </div>
    );
}
