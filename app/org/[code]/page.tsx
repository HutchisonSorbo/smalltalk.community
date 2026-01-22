/**
 * Public Organisation Profile Page
 * Publicly accessible profile page for organisations at /org/[code]
 */

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublicTenantByCode } from "@/lib/communityos/tenant-context";
import { safeUrl } from "@/lib/utils";
import {
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Youtube,
    Globe,
    Mail,
    Phone,
    MapPin,
    ExternalLink,
} from "lucide-react";
import type { Tenant } from "@/shared/schema";

interface OrgProfilePageProps {
    params: Promise<{ code: string }>;
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: OrgProfilePageProps): Promise<Metadata> {
    const { code } = await params;
    const tenant = await getPublicTenantByCode(code);

    if (!tenant) {
        return {
            title: "Organisation Not Found",
            description: "This organisation profile could not be found.",
        };
    }

    const description = tenant.missionStatement || tenant.description || `${tenant.name} on smalltalk.community`;

    return {
        title: tenant.name,
        description,
        openGraph: {
            title: `${tenant.name} | smalltalk.community`,
            description,
            type: "website",
            images: tenant.heroImageUrl ? [{ url: tenant.heroImageUrl }] : tenant.logoUrl ? [{ url: tenant.logoUrl }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title: `${tenant.name} | smalltalk.community`,
            description,
        },
    };
}

/**
 * Social link component with appropriate icon
 */
function SocialLink({ platform, url }: { platform: string; url: string }) {
    const icons: Record<string, React.ReactNode> = {
        facebook: <Facebook className="h-5 w-5" />,
        instagram: <Instagram className="h-5 w-5" />,
        twitter: <Twitter className="h-5 w-5" />,
        linkedin: <Linkedin className="h-5 w-5" />,
        youtube: <Youtube className="h-5 w-5" />,
    };

    const safeHref = safeUrl(url);
    if (!safeHref) return null;

    return (
        <a
            href={safeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-gray-600 hover:bg-primary hover:text-white transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-primary"
            aria-label={`Visit ${platform}`}
        >
            {icons[platform] || <ExternalLink className="h-5 w-5" />}
        </a>
    );
}

export default async function OrgProfilePage({ params }: OrgProfilePageProps) {
    const { code } = await params;
    const tenant = await getPublicTenantByCode(code);

    if (!tenant) {
        notFound();
    }

    const socialLinks = tenant.socialLinks as Record<string, string | undefined> | null;
    const hasSocialLinks = socialLinks && Object.values(socialLinks).some((url) => url);
    const hasContactInfo = tenant.contactEmail || tenant.contactPhone || tenant.address;

    return (
        <>
            {/* Hero Section */}
            <section className="relative">
                {/* Hero Image / Color Background */}
                <div
                    className="h-48 md:h-64 w-full"
                    style={{
                        backgroundColor: tenant.primaryColor || "#4F46E5",
                        backgroundImage: tenant.heroImageUrl ? `url(${tenant.heroImageUrl})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />

                {/* Logo Overlay */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 md:-bottom-20">
                    <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden dark:border-gray-800 dark:bg-gray-800">
                        {tenant.logoUrl ? (
                            <Image
                                src={tenant.logoUrl}
                                alt={`${tenant.name} logo`}
                                width={160}
                                height={160}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div
                                className="h-full w-full flex items-center justify-center text-4xl font-bold text-white"
                                style={{ backgroundColor: tenant.primaryColor || "#4F46E5" }}
                            >
                                {tenant.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-4 pt-20 md:pt-24 pb-16">
                {/* Name & Website */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                        {tenant.name}
                    </h1>
                    {tenant.website && (
                        <a
                            href={safeUrl(tenant.website) || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-primary hover:underline"
                        >
                            <Globe className="h-4 w-4" />
                            <span>{new URL(tenant.website).hostname}</span>
                        </a>
                    )}
                </div>

                {/* Mission Statement / About */}
                {(tenant.missionStatement || tenant.description) && (
                    <section className="mb-10">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            About
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {tenant.missionStatement || tenant.description}
                        </p>
                    </section>
                )}

                {/* Social Links */}
                {hasSocialLinks && (
                    <section className="mb-10">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Connect With Us
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(socialLinks || {}).map(([platform, url]) =>
                                url ? <SocialLink key={platform} platform={platform} url={url} /> : null
                            )}
                        </div>
                    </section>
                )}

                {/* Contact Info */}
                {hasContactInfo && (
                    <section className="mb-10">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Contact
                        </h2>
                        <div className="space-y-3 text-gray-600 dark:text-gray-300">
                            {tenant.contactEmail && (
                                <a
                                    href={`mailto:${tenant.contactEmail}`}
                                    className="flex items-center gap-2 hover:text-primary"
                                >
                                    <Mail className="h-5 w-5" />
                                    <span>{tenant.contactEmail}</span>
                                </a>
                            )}
                            {tenant.contactPhone && (
                                <a
                                    href={`tel:${tenant.contactPhone}`}
                                    className="flex items-center gap-2 hover:text-primary"
                                >
                                    <Phone className="h-5 w-5" />
                                    <span>{tenant.contactPhone}</span>
                                </a>
                            )}
                            {tenant.address && (
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-5 w-5 mt-0.5" />
                                    <span>{tenant.address}</span>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t bg-white py-8 dark:bg-gray-800/50">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Powered by{" "}
                        <Link
                            href="https://smalltalk.community"
                            className="font-semibold text-primary hover:underline"
                        >
                            smalltalk.community
                        </Link>
                    </p>
                    <a
                        href={`mailto:ryanhutchison@outlook.com.au?subject=Report%20Organisation%20Profile%3A%20${encodeURIComponent(tenant.name)}`}
                        className="mt-2 inline-block text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        Report this profile
                    </a>
                </div>
            </footer>
        </>
    );
}
