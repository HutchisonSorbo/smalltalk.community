"use client";

import dynamic from "next/dynamic";

const HubLanding = dynamic(
  () => import("@/components/hub/HubLanding").then((mod) => mod.HubLanding),
  { ssr: false }
);

export default function HubPage() {
    return <HubLanding />;
}

// CodeRabbit Audit Trigger
