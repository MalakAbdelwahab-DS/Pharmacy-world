import type { NextConfig } from "next";

// Static export for GitHub Pages. The site lives under /pharmacy-world on github.io,
// so the base path is set at build time (empty when running locally).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
