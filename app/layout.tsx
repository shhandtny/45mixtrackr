import type { Metadata } from 'next';
import './globals.css';
import { CookieBanner } from '@/components/CookieBanner';

const BASE_URL = 'https://www.45mixtrackr.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: '45 Mix Trackr — Identify Every Song in Your Mix',
    template: '%s — 45 Mix Trackr',
  },
  description:
    'Free DJ mix tracklist tool. Upload any audio or video mix to identify every song — get titles, artists, album covers, and a downloadable SRT subtitle file instantly.',
  keywords: [
    'DJ mix identifier',
    'identify songs in mix',
    'mix tracklist generator',
    'audio fingerprinting',
    'DJ tracklist',
    'song recognition',
    'album cover downloader',
    'SRT subtitle generator',
  ],
  openGraph: {
    type: 'website',
    siteName: '45 Mix Trackr',
    title: '45 Mix Trackr — Identify Every Song in Your Mix',
    description:
      'Upload your DJ mix to identify every song. Get titles, artists, album covers, and an SRT subtitle file in minutes.',
    url: BASE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: '45 Mix Trackr — Identify Every Song in Your Mix',
    description:
      'Upload your DJ mix to identify every song. Get titles, artists, album covers, and an SRT subtitle file in minutes.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-spotify-black text-white antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
