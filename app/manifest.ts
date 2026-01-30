import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "smalltalk.community",
        short_name: "SmallTalk",
        description: "Australia's leading not-for-profit operations platform.",
        start_url: "/dashboard",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#ffffff",
        theme_color: "#4F46E5",
        categories: ["business", "productivity"],

        // Shortcuts for quick access
        shortcuts: [
            {
                name: "CRM",
                short_name: "CRM",
                url: "/org/communityos?app=crm",
                icons: [{ src: "/icon-192x192.png", sizes: "192x192" }]
            },
            {
                name: "Rostering",
                short_name: "Roster",
                url: "/org/communityos?app=rostering",
                icons: [{ src: "/icon-192x192.png", sizes: "192x192" }]
            },
            {
                name: "Impact",
                short_name: "Impact",
                url: "/org/communityos?app=impact",
                icons: [{ src: "/icon-192x192.png", sizes: "192x192" }]
            },
        ],

        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon",
            },
            {
                src: "/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
            },
            {
                src: "/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
