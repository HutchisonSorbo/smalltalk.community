/**
 * 404 page for organisation profiles
 */

import Link from "next/link";

export default function OrgNotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <h1 className="text-6xl font-bold text-gray-200 dark:text-gray-700">404</h1>
                <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">
                    Organisation Not Found
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    The organisation profile you&apos;re looking for doesn&apos;t exist or isn&apos;t publicly available.
                </p>
                <Link
                    href="/"
                    className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
                >
                    Go to Homepage
                </Link>
            </div>
        </div>
    );
}
