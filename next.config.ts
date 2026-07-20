import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'edamam-product-images.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'edamam.com',
      },
      {
        protocol: 'https',
        hostname: '**.edamam.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  allowedDevOrigins: [
    '*.tunnelmole.net',
    '*.tunnelmole.com',
  ],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
