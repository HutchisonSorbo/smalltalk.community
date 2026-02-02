"use client";

import * as React from "react";
import { cn, safeUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface COSListItemProps {
    title: string;
    subtitle?: string;
    avatar?: string | React.ReactNode;
    badge?: React.ReactNode;
    trailing?: React.ReactNode;
    onClick?: () => void;
    selected?: boolean;
    disabled?: boolean;
    className?: string;
}

// --- Helpers ---

const AvatarBlock = ({ avatar, title }: { avatar: string | React.ReactNode; title: string }) => {
    const sanitizedAvatar = typeof avatar === "string" ? safeUrl(avatar) : null;

    if (!avatar) return null;

    return (
        <div className="flex-shrink-0">
            {typeof avatar === "string" ? (
                <Avatar className="h-10 w-10">
                    {sanitizedAvatar && <AvatarImage src={sanitizedAvatar} alt={title} />}
                    <AvatarFallback>{title.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
            ) : (
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {avatar}
                </div>
            )}
        </div>
    );
};

const ContentBlock = ({
    title,
    subtitle,
    badge,
}: {
    title: string;
    subtitle?: string;
    badge?: React.ReactNode;
}) => {
    return (
        <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                    {title}
                </span>
                {badge && <div className="flex-shrink-0">{badge}</div>}
            </div>
            {subtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {subtitle}
                </p>
            )}
        </div>
    );
};

// --- Main Component ---

export function COSListItem({
    title,
    subtitle,
    avatar,
    badge,
    trailing,
    onClick,
    selected,
    disabled,
    className,
}: COSListItemProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!disabled && onClick && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <li
            onClick={disabled ? undefined : onClick}
            onKeyDown={handleKeyDown}
            tabIndex={disabled || !onClick ? -1 : 0}
            aria-disabled={disabled}
            className={cn(
                "flex items-center gap-4 p-4 min-h-[64px] w-full max-w-full transition-colors outline-none",
                "bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 last:border-0",
                onClick && !disabled && "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 active:bg-slate-100 dark:active:bg-slate-800 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500",
                selected && "bg-slate-50 dark:bg-slate-900",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            <AvatarBlock avatar={avatar} title={title} />
            <ContentBlock title={title} subtitle={subtitle} badge={badge} />

            {/* Trailing */}
            {trailing && (
                <div className="flex-shrink-0 text-slate-500 dark:text-slate-400">
                    {trailing}
                </div>
            )}
        </li>
    );
}
