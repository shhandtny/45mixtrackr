import type { NextConfig } from 'next';

// Design Ref: §9 — bodyParser must be disabled globally for /api/upload
// so formidable can handle multipart streams directly (supports up to 500 MB)
const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: '45mixtrackr.com' }],
        destination: 'https://www.45mixtrackr.com/:path*',
        permanent: true,
      },
    ];
  },
  serverExternalPackages: ['fluent-ffmpeg', 'ffmpeg-static'],
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
  images: {
    // Allow Spotify CDN images for album covers
    remotePatterns: [
      { protocol: 'https', hostname: 'i.scdn.co' },
      { protocol: 'https', hostname: '*.scdn.co' },
      { protocol: 'https', hostname: 'mosaic.scdn.co' },
      { protocol: 'https', hostname: '*.mzstatic.com' },
    ],
  },
};

export default nextConfig;
