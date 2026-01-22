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

interface OrgProfilePageProps {
    params: Promise<{ code: string }>;
}

// Regex patterns for contact validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s+\-()]+$/;

/**
 * Safely extract hostname from a URL without throwing
 */
function getHostnameFromUrl(url: string): string | null {
    try {
        return new URL(url).hostname;
    } catch {
        return null;
    }
}

/**
 * Validate and sanitize email for mailto: links
 */
function validateEmail(email: string | null | undefined): string | null {
    if (!email || typeof email !== "string") return null;
    const trimmed = email.trim().replace(/[\r\n]/g, "");
    if (!EMAIL_REGEX.test(trimmed)) return null;
    return trimmed;
}

/**
 * Validate and sanitize phone for tel: links
 */
function validatePhone(phone: string | null | undefined): string | null {
    if (!phone || typeof phone !== "string") return null;
    const trimmed = phone.trim().replace(/[\r\n]/g, "");
    if (!PHONE_REGEX.test(trimmed)) return null;
    return trimmed;
}

/**
 * Sanitize address field
 */
function sanitizeAddress(address: string | null | undefined): string | null {
    if (!address || typeof address !== "string") return null;
    const sanitized = address
        .trim()
        .replace(/[\r\n\t]/g, " ")
        .replace(/\s+/g, " ");
    return sanitized.length > 0 ? sanitized : null;
}

// ============================================================================
// Extracted Components
// ============================================================================

interface OrgHeroProps {
    name: string;
    primaryColor: string | null | undefined;
    safeHeroUrl: string | undefined;
    safeLogoUrl: string | undefined;
}

/** Hero section with background and logo */
function OrgHero({ name, primaryColor, safeHeroUrl, safeLogoUrl }: OrgHeroProps) {
    const bgColor = primaryColor || "#4F46E5";
    return (
        <section className="relative">
            <div
                className="h-48 md:h-64 w-full bg-cover bg-center"
                style={{
                    backgroundColor: bgColor,
                    backgroundImage: safeHeroUrl ? `url(${safeHeroUrl})` : undefined,
                }}
            />
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 md:-bottom-20">
                <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden dark:border-gray-800 dark:bg-gray-800">
                    {safeLogoUrl ? (
                        <Image
                            src={safeLogoUrl}
                            alt={`${name} logo`}
                            width={160}
                            height={160}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div
                            className="h-full w-full flex items-center justify-center text-4xl font-bold text-white"
                            style={{ backgroundColor: bgColor }}
                        >
                            {name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

interface OrgHeaderProps {
    name: string;
    safeWebsiteUrl: string | undefined;
    websiteHostname: string | null;
}

/** Organisation name and website link */
function OrgHeader({ name, safeWebsiteUrl, websiteHostname }: OrgHeaderProps) {
    return (
        <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {name}
            </h1>
            {safeWebsiteUrl && websiteHostname && (
                <a
                    href={safeWebsiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-primary hover:underline"
                >
                    <Globe className="h-4 w-4" />
                    <span>{websiteHostname}</span>
                </a>
            )}
        </div>
    );
}

interface OrgAboutProps {
    content: string;
}

/** About/Mission statement section */
function OrgAbout({ content }: OrgAboutProps) {
    return (
        <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                About
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {content}
            </p>
        </section>
    );
}

interface OrgSocialLinksProps {
    socialLinks: Record<string, string | undefined>;
}

/** Social link component with appropriate icon */
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

/** Social links section */
function OrgSocialLinks({ socialLinks }: OrgSocialLinksProps) {
    return (
        <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Connect With Us
            </h2>
            <div className="flex flex-wrap gap-3">
                {Object.entries(socialLinks).map(([platform, url]) =>
                    url ? <SocialLink key={platform} platform={platform} url={url} /> : null
                )}
            </div>
        </section>
    );
}

interface OrgContactProps {
    email: string | null;
    phone: string | null;
    address: string | null;
}

/** Contact information section */
function OrgContact({ email, phone, address }: OrgContactProps) {
    return (
        <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Contact
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
                {email && (
                    <a
                        href={`mailto:${email}`}
                        className="flex items-center gap-2 hover:text-primary"
                    >
                        <Mail className="h-5 w-5" />
                        <span>{email}</span>
                    </a>
                )}
                {phone && (
                    <a
                        href={`tel:${phone}`}
                        className="flex items-center gap-2 hover:text-primary"
                    >
                        <Phone className="h-5 w-5" />
                        <span>{phone}</span>
                    </a>
                )}
                {address && (
                    <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 mt-0.5" />
                        <span>{address}</span>
                    </div>
                )}
            </div>
        </section>
    );
}

interface OrgFooterProps {
    tenantName: string;
}

/** Footer with powered-by and report link */
function OrgFooter({ tenantName }: OrgFooterProps) {
    return (
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
                    href={`mailto:ryanhutchison@outlook.com.au?subject=Report%20Organisation%20Profile%3A%20${encodeURIComponent(tenantName)}`}
                    className="mt-2 inline-block text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    Report this profile
                </a>
            </div>
        </footer>
    );
}

// ============================================================================
// Metadata Generation
// ============================================================================

/**
 * Generate metadata for SEO with error handling
 */
export async function generateMetadata({ params }: OrgProfilePageProps): Promise<Metadata> {
    const { code } = await params;

    try {
        const tenant = await getPublicTenantByCode(code);

        if (!tenant) {
            return {
                title: "Organisation Not Found",
                description: "This organisation profile could not be found.",
            };
        }

        const description = tenant.missionStatement || tenant.description || `${tenant.name} on smalltalk.community`;
        const safeHeroUrl = safeUrl(tenant.heroImageUrl);
        const safeLogoUrl = safeUrl(tenant.logoUrl);

        return {
            title: tenant.name,
            description,
            openGraph: {
                title: `${tenant.name} | smalltalk.community`,
                description,
                type: "website",
                images: safeHeroUrl ? [{ url: safeHeroUrl }] : safeLogoUrl ? [{ url: safeLogoUrl }] : [],
            },
            twitter: {
                card: "summary_large_image",
                title: `${tenant.name} | smalltalk.community`,
                description,
            },
        };
    } catch (error) {
        console.error(`[generateMetadata] Error fetching tenant "${code}":`, error);
        return {
            title: "Organisation Profile",
            description: "View organisation profile on smalltalk.community",
        };
    }
}

// ============================================================================
// Page Component
// ============================================================================

export default async function OrgProfilePage({ params }: OrgProfilePageProps) {
    const { code } = await params;

    let tenant;
    try {
        tenant = await getPublicTenantByCode(code);
    } catch (error) {
        console.error(`[OrgProfilePage] Error fetching tenant "${code}":`, error);
        notFound();
    }

    if (!tenant) {
        notFound();
    }

    // Prepare sanitized data once
    const socialLinks = tenant.socialLinks as Record<string, string | undefined> | null;
    const hasSocialLinks = socialLinks && Object.values(socialLinks).some((url) => url);

    const safeHeroUrl = safeUrl(tenant.heroImageUrl);
    const safeLogoUrl = safeUrl(tenant.logoUrl);
    const safeWebsiteUrl = safeUrl(tenant.website);
    const websiteHostname = tenant.website ? getHostnameFromUrl(tenant.website) : null;

    // Sanitize contact info once and reuse
    const validEmail = validateEmail(tenant.contactEmail);
    const validPhone = validatePhone(tenant.contactPhone);
    const sanitizedAddress = sanitizeAddress(tenant.address);
    const hasContactInfo = validEmail || validPhone || sanitizedAddress;

    const aboutContent = tenant.missionStatement || tenant.description;

    return (
        <div className="max-w-full overflow-hidden">
            <OrgHero
                name={tenant.name}
                primaryColor={tenant.primaryColor}
                safeHeroUrl={safeHeroUrl}
                safeLogoUrl={safeLogoUrl}
            />

            <main className="max-w-3xl mx-auto px-4 pt-20 md:pt-24 pb-16">
                <OrgHeader
                    name={tenant.name}
                    safeWebsiteUrl={safeWebsiteUrl}
                    websiteHostname={websiteHostname}
                />

                {aboutContent && <OrgAbout content={aboutContent} />}

                {hasSocialLinks && socialLinks && (
                    <OrgSocialLinks socialLinks={socialLinks} />
                )}

                {hasContactInfo && (
                    <OrgContact
                        email={validEmail}
                        phone={validPhone}
                        address={sanitizedAddress}
                    />
                )}
            </main>

            <OrgFooter tenantName={tenant.name} />
        </div>
    );
}
