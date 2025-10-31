import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com'
      }
    ]
  }
};

export default nextConfig;

