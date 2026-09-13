import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep repo AGENTS.md under our control; Next still documents itself in node_modules.
  agentRules: false,
  images: {
    // Local bottle assets are SVGs in /public; allow serving them via next/image.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
