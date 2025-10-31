import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: false,
  },
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  images: {
    formats: ["image/webp"],
    qualities: [75, 90, 100],
  },
};

export default nextConfig;
