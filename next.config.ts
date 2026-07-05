import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '*.tunnelmole.net',
    '*.tunnelmole.com',
  ],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
