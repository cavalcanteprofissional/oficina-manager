import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['54.232.189.113'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'itueopegwvlqyfznkuws.supabase.co',
      },
    ],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ]
  },
};

export default nextConfig;
