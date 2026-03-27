import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better dev warnings
  reactStrictMode: true,

  // Images: allow the public/ folder mascot PNGs
  images: {
    // No remote patterns needed — all images are local
    localPatterns: [
      { pathname: "/mascot-*.png" },
    ],
  },

  // Performance: compress responses
  compress: true,
};

export default nextConfig;
