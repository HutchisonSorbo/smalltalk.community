/**
 * Public Organisation Profile Layout
 * Minimal layout for public-facing profile pages (no auth required)
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        template: "%s | smalltalk.community",
        default: "Organisation Profile | smalltalk.community",
    },
};

import { getPublicTenantByCode } from "@/lib/communityos/tenant-context";

interface OrgLayoutProps {
    children: React.ReactNode;
    params: Promise<{ code: string }>;
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
    const { code } = await params;
    const tenant = await getPublicTenantByCode(code);

    const colorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

    const primaryColor = (tenant?.primaryColor && colorRegex.test(tenant.primaryColor))
        ? tenant.primaryColor
        : "#4F46E5";

    const secondaryColor = (tenant?.secondaryColor && colorRegex.test(tenant.secondaryColor))
        ? tenant.secondaryColor
        : "#818CF8";

    return (
        <div
            className="min-h-screen max-w-full bg-gray-50 dark:bg-gray-900"
            style={{
                "--tenant-primary": primaryColor,
                "--tenant-secondary": secondaryColor,
                "--primary": primaryColor, // Override default primary for this tenant
            } as React.CSSProperties}
        >
            {children}
        </div>
    );
}
