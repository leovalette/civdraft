import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: false,
  },
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
};

export default nextConfig;
