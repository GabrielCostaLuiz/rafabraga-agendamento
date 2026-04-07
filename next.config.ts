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
    script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vercel-scripts.com https://embed-cdn.spotifycdn.com https://open.spotify.com;
    style-src 'self' 'unsafe-inline' fonts.googleapis.com;
    img-src 'self' blob: data: images.unsplash.com res.cloudinary.com https://i.scdn.co https://*.spotifycdn.com https://*.scdn.co;
    font-src 'self' fonts.gstatic.com data:;
    connect-src 'self' *.vercel.app viacep.com.br https://*.spotify.com;
    media-src 'self' blob: data: https://*.spotifycdn.com;
    object-src 'none';
    frame-src 'self' https://open.spotify.com https://embed.spotify.com;
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
