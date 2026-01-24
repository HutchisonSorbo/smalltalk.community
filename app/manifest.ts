import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "smalltalk.community",
        short_name: "SmallTalk",
        description: "Multi-tenant platform for community connection and development.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#4F46E5",
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
