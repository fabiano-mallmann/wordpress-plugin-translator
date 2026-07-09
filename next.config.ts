import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ps.w.org",
      },
    ],
  },
};

export default nextConfig;
