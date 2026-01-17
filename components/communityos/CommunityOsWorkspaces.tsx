"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { safeUrl } from "@/lib/utils";
import type { TenantWithMembership, CommunityOsRole } from "@/shared/schema";

interface CommunityOsWorkspacesProps {
    memberships: TenantWithMembership[];
}

function getRoleBadgeVariant(role: CommunityOsRole): "default" | "secondary" | "outline" {
    switch (role) {
        case "admin": return "default";
        case "board": return "secondary";
        default: return "outline";
    }
}

export function CommunityOsWorkspaces({ memberships }: CommunityOsWorkspacesProps) {
    if (memberships.length === 0) {
        return (
            <Card className="bg-gray-50 dark:bg-gray-900 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Building2 className="h-12 w-12 text-gray-400 mb-4" />
                    <CardTitle className="text-lg">No Workspaces Found</CardTitle>
                    <CardDescription>
                        You are not a member of any CommunityOS organizations yet.
                    </CardDescription>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {memberships.map((membership) => {
                const logoSrc = membership.tenant.logoUrl ? safeUrl(membership.tenant.logoUrl) : null;

                return (
                    <Card key={membership.tenant.id} className="group hover:shadow-md transition-shadow">
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                {logoSrc ? (
                                    <img
                                        src={logoSrc}
                                        alt={membership.tenant.name}
                                        className="h-10 w-10 rounded object-cover"
                                    />
                                ) : (
                                    <div
                                        className="h-10 w-10 rounded flex items-center justify-center text-white font-bold bg-[var(--tenant-color,#6366f1)]"
                                        // Dynamic color from tenant data - CSS custom property allows theming
                                        {...{ style: { '--tenant-color': membership.tenant.primaryColor } as React.CSSProperties }}
                                    >
                                        {membership.tenant.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <Badge variant={getRoleBadgeVariant(membership.role)}>
                                    {membership.role.charAt(0).toUpperCase() + membership.role.slice(1)}
                                </Badge>
                            </div>
                            <CardTitle className="text-xl mt-4 line-clamp-1">{membership.tenant.name}</CardTitle>
                            <CardDescription className="line-clamp-2 min-h-[40px]">
                                {membership.tenant.description || "CommunityOS Workspace"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link
                                href={`/communityos/${encodeURIComponent(membership.tenant.code)}/dashboard`}
                                className="inline-flex items-center text-sm font-medium text-primary hover:underline group-hover:translate-x-0.5 transition-transform"
                            >
                                Enter Workspace <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
