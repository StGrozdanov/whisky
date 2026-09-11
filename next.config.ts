import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep repo AGENTS.md under our control; Next still documents itself in node_modules.
  agentRules: false,
};

export default nextConfig;
