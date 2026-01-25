/**
 * Tenant Profile Settings Page
 * Management interface for tenant admins to update their public profile
 */

import { notFound, redirect } from "next/navigation";
import { getTenantByCode, isTenantAdmin } from "@/lib/communityos/tenant-context";
import { createClient } from "@/lib/supabase-server";
import { TenantProfileEditor } from "@/components/communityos/TenantProfileEditor";

interface ProfileSettingsPageProps {
    params: Promise<{ tenantId: string }>;
}

export default async function ProfileSettingsPage({ params }: ProfileSettingsPageProps) {
    const { tenantId: tenantCode } = await params;

    // Fetch tenant
    const tenant = await getTenantByCode(tenantCode);
    if (!tenant) {
        notFound();
    }

    // Verify admin access
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/login?next=/communityos/${tenantCode}/settings/profile`);
    }

    const isAdmin = await isTenantAdmin(user.id, tenant.id);
    if (!isAdmin) {
        redirect(`/communityos/${tenantCode}/dashboard`);
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organisation Profile</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Manage how your organisation appears on smalltalk.community
                </p>
            </div>

            <TenantProfileEditor tenant={tenant} />
        </div>
    );
}
