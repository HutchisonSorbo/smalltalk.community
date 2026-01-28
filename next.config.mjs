import { withSentryConfig } from '@sentry/nextjs';
import { withBotId } from 'botid/next/config';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Use standalone output for optimized Vercel deployment
    output: 'standalone',

    // External packages excluded from serverless function bundling to stay under 250MB limit
    // These packages are large and/or contain native binaries that shouldn't be bundled
    serverExternalPackages: [
        // Database and ORM
        'mysql2',
        'drizzle-kit',
        'postgres',
        'pg',

        // P2P/Native packages
        '@dittolive/ditto',

        // Payload CMS and dependencies (188MB combined)
        'payload',
        '@payloadcms/db-postgres',
        '@payloadcms/richtext-lexical',
        '@payloadcms/next',
        '@payloadcms/drizzle',
        '@payloadcms/graphql',
        '@payloadcms/ui',
        '@payloadcms/translations',

        // Image processing
        'sharp',

        // Observability
        'newrelic',
    ],
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
                        value: `default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ""} 'unsafe-inline' blob: https://challenges.cloudflare.com ${vercelScripts} ${vercelLive}; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://jgtgvxzxgkudctocoxsq.supabase.co https://images.unsplash.com https://lh3.googleusercontent.com https://*.tile.openstreetmap.org https://unpkg.com https://raw.githubusercontent.com https://cdnjs.cloudflare.com https://vercel.com; font-src 'self' data:; connect-src 'self' https://jgtgvxzxgkudctocoxsq.supabase.co https://*.sentry.io ${vercelScripts} ${vercelLive}; frame-src 'self' https://challenges.cloudflare.com ${vercelLive}; worker-src 'self' blob:; frame-ancestors 'none'; upgrade-insecure-requests`
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
    experimental: {
        optimizePackageImports: ['lucide-react', 'react-icons'],
        outputFileTracingIncludes: {
            '*': ['./newrelic.js'],
        },
    },
    outputFileTracingExcludes: {
        '*': [
            'node_modules/@dittolive/ditto/node/ditto.linux-arm64.node',
            'node_modules/@dittolive/ditto/node/ditto.darwin-x64.node',
            'node_modules/@dittolive/ditto/node/ditto.darwin-arm64.node',
            'node_modules/@dittolive/ditto/node/ditto.win32-x64.node',
            'node_modules/@next/swc-linux-arm64-gnu/**',
            'node_modules/@next/swc-linux-arm64-musl/**',
            'node_modules/@next/swc-darwin-x64/**',
            'node_modules/@next/swc-darwin-arm64/**',
            'node_modules/@next/swc-win32-x64-msvc/**',
            'node_modules/@next/swc-win32-ia32-msvc/**',
            'node_modules/@next/swc-win32-arm64-msvc/**',
        ],
    },
};

/**
 * Sentry Configuration
 * 
 * KNOWN WARNINGS (can be safely ignored):
 * - "*_client-reference-manifest.js (no sourcemap found)" - These are internal Next.js
 *   build artifacts that don't have source maps by design. They don't affect error
 *   tracking for application code. Your actual source files will still be properly
 *   symbolicated in Sentry.
 * 
 * Requirements for Turbopack source map support:
 * - @sentry/nextjs >= 10.13.0 (current: 10.32.1 ✓)
 * - next >= 15.4.1 (current: 16.1.2 ✓)
 */
export default withBotId(withSentryConfig(nextConfig, {
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

    // tunnelRoute: "/monitoring",

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

    // Suppress verbose debug logging during source map upload
    // This reduces noise from client-reference-manifest.js warnings
    debug: false,

    // Eliminate source map reference warnings for internal Next.js artifacts
    ignore: ["**/_client-reference-manifest.js"],
}));
