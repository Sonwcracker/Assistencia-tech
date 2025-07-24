// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "s3.amazonaws.com",
      "cptstatic.s3.amazonaws.com", // opcionalmente esse também
    ],
  },
};

export default nextConfig;
