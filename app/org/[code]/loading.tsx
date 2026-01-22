/**
 * Loading skeleton for public organisation profile
 */

export default function OrgProfileLoading() {
    return (
        <>
            {/* Hero Skeleton */}
            <section className="relative">
                <div className="h-48 md:h-64 w-full bg-gray-200 animate-pulse dark:bg-gray-700" />
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 md:-bottom-20">
                    <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white bg-gray-300 animate-pulse dark:border-gray-800 dark:bg-gray-600" />
                </div>
            </section>

            {/* Content Skeleton */}
            <main className="max-w-3xl mx-auto px-4 pt-20 md:pt-24 pb-16">
                <div className="text-center mb-8">
                    <div className="h-10 w-64 mx-auto bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
                    <div className="h-5 w-40 mx-auto mt-3 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
                </div>

                <div className="mb-10">
                    <div className="h-6 w-24 mb-3 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
                        <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
                        <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
                    </div>
                </div>
            </main>
        </>
    );
}
