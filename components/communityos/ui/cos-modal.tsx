"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface COSModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    variant?: 'modal' | 'drawer' | 'full';
    className?: string;
}

const COSModal = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    variant = 'modal',
    className
}: COSModalProps) => {
    const [shouldRender, setShouldRender] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) setShouldRender(true);
    }, [isOpen]);

    const onAnimationEnd = () => {
        if (!isOpen) setShouldRender(false);
    };

    if (!shouldRender) return null;

    const variantStyles = {
        modal: "max-w-lg w-[95%] rounded-3xl self-center",
        drawer: "max-w-none w-full rounded-t-3xl self-end h-[90vh] md:h-auto md:max-w-lg md:self-center md:rounded-3xl",
        full: "max-w-none w-full h-full",
    };

    const animationStyles = {
        modal: isOpen ? "animate-in fade-in zoom-in-95 duration-200" : "animate-out fade-out zoom-out-95 duration-200",
        drawer: isOpen ? "animate-in slide-in-from-bottom duration-300 ease-out" : "animate-out slide-out-to-bottom duration-300 ease-in",
        full: isOpen ? "animate-in fade-in slide-in-from-bottom-4 duration-300" : "animate-out fade-out slide-out-to-bottom-4 duration-300",
    };

    return (
        <div
            className={cn(
                "fixed inset-0 z-[100] flex justify-center bg-black/60 backdrop-blur-sm",
                isOpen ? "animate-in fade-in duration-200" : "animate-out fade-out duration-200",
                variant === 'full' ? "" : "p-4"
            )}
            onClick={(e) => e.target === e.currentTarget && onClose()}
            onAnimationEnd={onAnimationEnd}
        >
            <div
                className={cn(
                    "bg-background shadow-2xl flex flex-col overflow-hidden border",
                    variantStyles[variant],
                    animationStyles[variant],
                    className
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                    <div className="flex-1 min-w-0 pr-8">
                        {title && <h2 className="text-xl font-bold tracking-tight truncate">{title}</h2>}
                        {description && <p className="text-sm text-muted-foreground truncate">{description}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-muted">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-5 border-t bg-muted/30 flex flex-col md:flex-row-reverse gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export { COSModal };
