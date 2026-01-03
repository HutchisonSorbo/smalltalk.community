import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Work Experience Hub",
    description: "Find work experience placements across Victoria. Explore different industries and build valuable workplace skills with short-term placements for ages 13+.",
};

export default function WorkExperienceHubLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
