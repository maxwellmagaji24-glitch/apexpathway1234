import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'https://apex-backend-production-fbe2.up.railway.app/uploads/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'https://apex-backend-production-fbe2.up.railway.app/:path*',
      },
    ];
  },
};

export default nextConfig;
