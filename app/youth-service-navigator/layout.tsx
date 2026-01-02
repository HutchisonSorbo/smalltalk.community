export default function YouthServiceNavigatorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1">{children}</main>

            {/* Crisis Support Footer - Always Visible */}
            <footer className="bg-accent border-t border-secondary p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-background border-2 border-destructive rounded-lg p-4 mb-4">
                        <h3 className="font-semibold text-foreground mb-3">
                            Crisis Support (24/7)
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <strong>Lifeline:</strong>{" "}
                                <a href="tel:131114" className="text-primary hover:underline">
                                    13 11 14
                                </a>
                            </li>
                            <li>
                                <strong>Kids Helpline:</strong>{" "}
                                <a href="tel:1800551800" className="text-primary hover:underline">
                                    1800 55 1800
                                </a>{" "}
                                (5-25 years)
                            </li>
                            <li>
                                <strong>Beyond Blue:</strong>{" "}
                                <a href="tel:1300224636" className="text-primary hover:underline">
                                    1300 22 4636
                                </a>
                            </li>
                            <li>
                                <strong>Emergency:</strong>{" "}
                                <a href="tel:000" className="text-primary hover:underline font-bold">
                                    000
                                </a>
                            </li>
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
