/**
 * Public Organisation Profile Page
 * Publicly accessible profile page for organisations at /org/[code]
 */

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublicTenantByCode, isTenantAdmin } from "@/lib/communityos/tenant-context";
import { createClient } from "@/lib/supabase-server";
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
    Users,
    Star,
    CheckCircle,
    Edit,
} from "lucide-react";
import type {
    ImpactStat,
    Program,
    TeamMember,
    GalleryImage,
    Testimonial,
    CtaButton as OrgCTA,
    UpcomingEvent
} from "@/shared/schema";

interface OrgProfilePageProps {
    params: Promise<{ code: string }>;
}

// Regex patterns for contact validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s+\-()]+$/;

// --- Interfaces for Type Safety ---



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

/**
 * Sanitize user input for safe logging (prevent log injection)
 */
function sanitizeLogCode(input: unknown): string {
    if (typeof input !== "string") return "[invalid]";
    return input
        .slice(0, 64)
        .replace(/[\r\n\t]/g, "")
        .replace(/[^\w\-_.]/g, "_");
}

/**
 * Admin Edit Controls (Fixed overlay)
 */
function AdminControls({ tenantCode }: { tenantCode: string }) {
    const sanitizedCode = encodeURIComponent(tenantCode);
    return (
        <div className="fixed bottom-6 right-6 z-50 print:hidden">
            <Link
                href={`/communityos/${sanitizedCode}/dashboard`}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-semibold shadow-lg hover:scale-105 transition-transform hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border border-white/10"
                aria-label="Edit Public Profile"
            >
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
            </Link>
        </div>
    );
}

// ============================================================================
// Extracted Components
// ============================================================================

interface OrgHeroProps {
    name: string;
    primaryColor?: string | null;
    safeHeroUrl: string | null | undefined;
    safeLogoUrl: string | null | undefined;
}

/** Hero section with background and logo */
function OrgHero({ name, primaryColor, safeHeroUrl, safeLogoUrl }: OrgHeroProps) {
    const bgColor = primaryColor || 'var(--tenant-primary)';

    return (
        <section className="relative">
            <div
                className="h-48 md:h-64 w-full bg-cover bg-center"
                style={{
                    backgroundImage: safeHeroUrl ? `url(${safeHeroUrl})` : undefined,
                    backgroundColor: !safeHeroUrl ? bgColor : undefined,
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
                            className="h-full w-full flex items-center justify-center text-4xl font-bold text-white shadow-inner"
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
                    className="inline-flex items-center gap-1 mt-2 text-[var(--tenant-primary)] hover:underline"
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
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-gray-600 hover:bg-[var(--tenant-primary)] hover:text-white transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-[var(--tenant-primary)]"
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
                        className="flex items-center gap-2 hover:text-[var(--tenant-primary)]"
                    >
                        <Mail className="h-5 w-5" />
                        <span>{email}</span>
                    </a>
                )}
                {phone && (
                    <a
                        href={`tel:${phone}`}
                        className="flex items-center gap-2 hover:text-[var(--tenant-primary)]"
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

interface OrgImpactProps {
    stats: ImpactStat[];
}

function OrgImpact({ stats }: OrgImpactProps) {
    if (!stats || stats.length === 0) return null;
    return (
        <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                Our Impact
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {stats.map((stat, idx) => {
                    // Supported icons: users, star, check, map, globe, mail, phone
                    const IconComponent = {
                        users: Users,
                        star: Star,
                        check: CheckCircle,
                        checkCircle: CheckCircle,
                        map: MapPin,
                        mappin: MapPin,
                        globe: Globe,
                        mail: Mail,
                        phone: Phone,
                    }[(stat.icon ?? 'star').toLowerCase()] || Star;

                    return (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border text-center flex flex-col items-center justify-center gap-2">
                            <div className="p-3 rounded-full bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] mb-1">
                                <IconComponent className="h-6 w-6" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{stat.value ?? '0'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">{stat.label ?? 'Metric'}</div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

interface OrgProgramsProps {
    programs: Program[];
}

function OrgPrograms({ programs }: OrgProgramsProps) {
    if (!programs || programs.length === 0) return null;
    return (
        <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                Programs & Services
            </h2>
            <div className="space-y-4">
                {programs.map((prog, idx) => {
                    const safeLink = prog.linkUrl ? safeUrl(prog.linkUrl) : undefined;
                    return (
                        <div key={idx} className="p-5 border rounded-xl bg-white dark:bg-gray-800/20 shadow-sm border-l-4 border-l-[var(--tenant-primary)]">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{prog.title || 'Untitled Program'}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">{prog.description || ''}</p>
                            {safeLink && (
                                <a href={safeLink} className="text-xs font-semibold text-[var(--tenant-primary)] hover:underline flex items-center gap-1">
                                    Learn More <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

interface OrgTeamProps {
    team: TeamMember[];
}

function OrgTeam({ team }: OrgTeamProps) {
    if (!team || team.length === 0) return null;
    return (
        <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                Leadership & Team
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {team.map((member, idx) => {
                    const safeLinkedin = member.linkedinUrl ? safeUrl(member.linkedinUrl) : undefined;
                    return (
                        <div key={idx} className="flex items-center gap-4 p-4 border rounded-xl">
                            <div
                                className="h-12 w-12 rounded-full flex items-center justify-center font-bold"
                                style={{
                                    backgroundColor: 'color-mix(in srgb, var(--tenant-primary), transparent 90%)',
                                    color: 'var(--tenant-primary)'
                                }}
                            >
                                <span>{member.name?.[0] || '?'}</span>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900 dark:text-white truncate">{member.name || 'Unknown Member'}</div>
                                <div className="text-sm text-gray-500 truncate">{member.title || ''}</div>
                                {safeLinkedin && (
                                    <a href={safeLinkedin} className="text-xs text-[#0A66C2] hover:underline" target="_blank" rel="noopener noreferrer">
                                        LinkedIn
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

interface OrgGalleryProps {
    gallery: GalleryImage[];
}

function OrgGallery({ gallery }: OrgGalleryProps) {
    if (!gallery || gallery.length === 0) return null;
    return (
        <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                Photo Gallery
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {gallery.map((img, idx) => {
                    const safeImg = safeUrl(img.url);
                    if (!safeImg) return null;
                    return (
                        <div key={idx} className="aspect-square rounded-xl overflow-hidden border bg-[var(--tenant-primary)]/5 dark:bg-[var(--tenant-primary)]/10">
                            <Image
                                src={safeImg}
                                alt={img.caption || `Organisation gallery photo ${idx + 1}`}
                                width={400}
                                height={400}
                                unoptimized
                                className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                            />
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

interface OrgTestimonialsProps {
    testimonials: Testimonial[];
}

function OrgTestimonials({ testimonials }: OrgTestimonialsProps) {
    if (!testimonials || testimonials.length === 0) return null;
    return (
        <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider text-center">
                Testimonials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((t, idx) => {
                    const safeAvatar = t.imageUrl ? safeUrl(t.imageUrl) : undefined;
                    return (
                        <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-gray-800/20 border shadow-sm relative italic flex flex-col">
                            <div className="text-gray-600 dark:text-gray-300 mb-6 flex-grow line-clamp-4">&quot;{t.quote || ''}&quot;</div>
                            <div className="flex items-center gap-3">
                                {safeAvatar ? (
                                    <div className="h-10 w-10 rounded-full overflow-hidden border">
                                        <Image
                                            src={safeAvatar}
                                            alt={t.author || 'Contributor'}
                                            width={40}
                                            height={40}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 not-italic font-bold">
                                        {t.author?.[0] || '?'}
                                    </div>
                                )}
                                <div className="not-italic overflow-hidden">
                                    <div className="font-bold text-sm text-[var(--tenant-primary)] truncate">— {t.author || 'Anonymous'}</div>
                                    {t.role && <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{t.role}</div>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

interface OrgEventsProps {
    events: UpcomingEvent[];
}

function OrgEvents({ events }: OrgEventsProps) {
    if (!events || events.length === 0) return null;
    return (
        <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                Upcoming Events
            </h2>
            <div className="space-y-4">
                {events.map((event, idx) => {
                    const safeEventUrl = event.url ? safeUrl(event.url) : undefined;
                    return (
                        <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-5 border rounded-xl bg-white dark:bg-gray-800/20 shadow-sm gap-4">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{event.title || 'Untitled Event'}</h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        <span>{event.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        <span>{event.location}</span>
                                    </div>
                                </div>
                            </div>
                            {safeEventUrl && (
                                <a
                                    href={safeEventUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-[var(--tenant-primary)] hover:text-white transition-colors text-center"
                                >
                                    Event Details
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

interface OrgCTAsProps {
    ctas: OrgCTA[];
}

function OrgCTAs({ ctas }: OrgCTAsProps) {
    if (!ctas || ctas.length === 0) return null;

    const getCtaClass = (style: string) => {
        const base = "px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-center";
        switch (style) {
            case 'secondary':
                return `${base} bg-[var(--tenant-secondary)] text-white hover:opacity-90`;
            case 'outline':
                return `${base} border-2 border-[var(--tenant-primary)] text-[var(--tenant-primary)] hover:bg-[var(--tenant-primary)] hover:text-white`;
            case 'primary':
            default:
                return `${base} bg-[var(--tenant-primary)] text-white hover:opacity-90`;
        }
    };

    return (
        <section className="mb-12">
            <div className="flex flex-wrap justify-center gap-4">
                {ctas.map((cta, idx) => {
                    const safeCtaUrl = safeUrl(cta.url);
                    if (!safeCtaUrl) return null;
                    return (
                        <a
                            key={idx}
                            href={safeCtaUrl}
                            className={getCtaClass(cta.style || 'primary')}
                        >
                            {cta.label}
                        </a>
                    );
                })}
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
        console.error(`[generateMetadata] Error fetching tenant "${sanitizeLogCode(code)}":`, error);
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
        console.error(`[OrgProfilePage] Error fetching tenant "${sanitizeLogCode(code)}":`, error);
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

    // Check for admin access to show edit controls
    let isAdmin = false;
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error(`Error fetching user for admin check (tenant=${sanitizeLogCode(code)}):`, authError);
        } else if (user && tenant.id) {
            isAdmin = await isTenantAdmin(user.id, tenant.id);
        }
    } catch (err) {
        console.error(`Unexpected error checking admin status for tenant=${sanitizeLogCode(code)}:`, err);
    }

    return (
        <div className="max-w-full overflow-hidden">
            <main className="max-w-3xl mx-auto px-4 pt-20 md:pt-24 pb-16">
                <OrgHeader
                    name={tenant.name}
                    safeWebsiteUrl={safeWebsiteUrl}
                    websiteHostname={websiteHostname}
                />

                <OrgHero
                    name={tenant.name}
                    primaryColor={tenant.primaryColor}
                    safeHeroUrl={safeHeroUrl}
                    safeLogoUrl={safeLogoUrl}
                />

                <div className="mt-12">
                    {aboutContent && <OrgAbout content={aboutContent} />}

                    {tenant.impactStats && tenant.impactStats.length > 0 && (
                        <OrgImpact stats={tenant.impactStats} />
                    )}

                    {tenant.programs && tenant.programs.length > 0 && (
                        <OrgPrograms programs={tenant.programs} />
                    )}

                    {tenant.gallery && tenant.gallery.length > 0 && (
                        <OrgGallery gallery={tenant.gallery} />
                    )}

                    {tenant.teamMembers && tenant.teamMembers.length > 0 && (
                        <OrgTeam team={tenant.teamMembers} />
                    )}

                    {tenant.events && tenant.events.length > 0 && (
                        <OrgEvents events={tenant.events} />
                    )}

                    {tenant.testimonials && tenant.testimonials.length > 0 && (
                        <OrgTestimonials testimonials={tenant.testimonials} />
                    )}

                    {tenant.ctas && tenant.ctas.length > 0 && (
                        <OrgCTAs ctas={tenant.ctas} />
                    )}

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
                </div>
            </main>

            <OrgFooter tenantName={tenant.name} />

            {isAdmin && <AdminControls tenantCode={tenant.code} />}
        </div>
    );
}
