/**
 * PrintFooter Component
 * Branded footer that appears when printing CommunityOS documents
 */

"use client";

import { useTenant } from "./TenantProvider";

interface PrintFooterProps {
    documentTitle?: string;
    showTimestamp?: boolean;
}

export function PrintFooter({
    documentTitle,
    showTimestamp = true,
}: PrintFooterProps) {
    const { tenant } = useTenant();

    return (
        <footer className="communityos-print-footer hidden print:block fixed bottom-0 left-0 right-0 border-t bg-white py-2 text-center text-xs text-gray-500">
            <div className="flex items-center justify-between px-8">
                <div className="flex items-center gap-2">
                    {tenant?.logoUrl && (
                        <img
                            src={tenant.logoUrl}
                            alt=""
                            className="h-4 w-auto"
                        />
                    )}
                    <span className="font-medium">{tenant?.name}</span>
                </div>

                <div className="text-center">
                    {documentTitle && <span>{documentTitle} • </span>}
                    <span>Powered by CommunityOS</span>
                </div>

                <div className="text-right">
                    {showTimestamp && (
                        <span>
                            Printed: {new Date().toLocaleDateString("en-AU", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })}
                        </span>
                    )}
                </div>
            </div>
        </footer>
    );
}

/**
 * Print styles that should be included in global CSS
 * 
 * @media print {
 *   .communityos-print-footer {
 *     display: block !important;
 *   }
 *   
 *   @page {
 *     margin-bottom: 50px;
 *   }
 *   
 *   body::after {
 *     content: "";
 *     display: block;
 *     height: 50px;
 *   }
 * }
 */
