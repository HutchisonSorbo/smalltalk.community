import React, { useEffect, useState } from 'react';
import { useInstallPrompt } from '@/hooks/use-install-prompt';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export function InstallPrompt() {
    const { isInstallable, isInstalled, install, dismiss } = useInstallPrompt();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isInstallable && !isInstalled) {
            // Delay showing the prompt slightly to avoid layout shift immediately
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [isInstallable, isInstalled]);

    if (!isVisible) return null;

    return (
        <div className={cn(
            "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 max-w-full z-50",
            "transition-all duration-300 ease-in-out transform translate-y-0",
            "animate-in slide-in-from-bottom-5 fade-in"
        )}>
            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg shadow-lg p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Download className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">Install App</h3>
                        <p className="text-xs text-muted-foreground">Add to home screen for offline access</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={install} size="sm" className="h-8">
                        Install
                    </Button>
                    <Button onClick={dismiss} variant="ghost" size="icon" className="h-8 w-8" aria-label="Dismiss">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
