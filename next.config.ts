import type { NextConfig } from "next";

// Backend API URL - change to localhost:8080 for local development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://govershop-govershop-be.lzfki7.easypanel.host';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${API_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
