import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next ne recrée pas AGENTS.md à la racine (la consigne est dans .claude/CLAUDE.md)
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
