import type { NextConfig } from "next";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || (isGitHubActions ? "/portfolio" : "");

const nextConfig: NextConfig = {
  ...(isGitHubActions && {
    output: "export",
    basePath: basePath,
    images: {
      unoptimized: true,
    },
  }),
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
