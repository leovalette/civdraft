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
  headers: async () => [
    {
      // Cache static assets aggressively
      source: "/:path*.(png|jpg|jpeg|webp|gif|svg|ico|woff2|ttf|wav)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};

export default nextConfig;
