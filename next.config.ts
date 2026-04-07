import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vercel-scripts.com;
      style-src 'self' 'unsafe-inline' fonts.googleapis.com;
      img-src 'self' blob: data: images.unsplash.com res.cloudinary.com;
      font-src 'self' fonts.gstatic.com data:;
      connect-src 'self' *.vercel.app viacep.com.br;
      media-src 'self';
      object-src 'none';
      frame-src 'none';
    `.replace(/\s{2,}/g, ' ').trim()
  }
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
