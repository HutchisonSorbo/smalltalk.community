import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {

    serverExternalPackages: ['mysql2', 'drizzle-kit', '@dittolive/ditto'],
    typescript: {
        ignoreBuildErrors: false, // Ensure we still catch TS errors
    },
    reactStrictMode: true,
    poweredByHeader: false,
    compress: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'jgtgvxzxgkudctocoxsq.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    async headers() {
        // Allow Vercel Live in all environments
        // Vercel Live scripts
        const vercelLive = 'https://vercel.live';
        const vercelScripts = 'https://va.vercel-scripts.com';

        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://challenges.cloudflare.com ${vercelScripts} ${vercelLive}; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://jgtgvxzxgkudctocoxsq.supabase.co https://images.unsplash.com https://lh3.googleusercontent.com https://*.tile.openstreetmap.org https://unpkg.com https://raw.githubusercontent.com https://cdnjs.cloudflare.com https://vercel.com; font-src 'self' data:; connect-src 'self' https://jgtgvxzxgkudctocoxsq.supabase.co https://*.sentry.io ${vercelScripts} ${vercelLive}; frame-src 'self' https://challenges.cloudflare.com ${vercelLive}; worker-src 'self' blob:; frame-ancestors 'none'; upgrade-insecure-requests`
                    }
                ]
            }
        ]
    },
    async redirects() {
        return [
            {
                source: '/signup',
                destination: '/login?signup=true',
                permanent: false,
            },
        ]
    },
};

export default withSentryConfig(nextConfig, {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "ryan-hutchison",

    project: "javascript-nextjs",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: "/monitoring",

    webpack: {
        // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
        // See the following for more information:
        // https://docs.sentry.io/product/crons/
        // https://vercel.com/docs/cron-jobs
        automaticVercelMonitors: true,

        // Tree-shaking options for reducing bundle size
        treeshake: {
            // Automatically tree-shake Sentry logger statements to reduce bundle size
            removeDebugLogging: true,
        },
    },
});
