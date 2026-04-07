import type { NextConfig } from 'next';

// Design Ref: §9 — bodyParser must be disabled globally for /api/upload
// so formidable can handle multipart streams directly (supports up to 500 MB)
const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ['fluent-ffmpeg', 'ffmpeg-static'],
  images: {
    // Allow Spotify CDN images for album covers
    remotePatterns: [
      { protocol: 'https', hostname: 'i.scdn.co' },
      { protocol: 'https', hostname: '*.scdn.co' },
      { protocol: 'https', hostname: 'mosaic.scdn.co' },
    ],
  },
};

export default nextConfig;
