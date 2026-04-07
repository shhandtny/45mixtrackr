import type { Metadata } from 'next';
import { MixIdentifier } from '@/components/MixIdentifier';

export const metadata: Metadata = {
  title: '45 Mix Trackr — Identify Every Song in Your Mix',
  description:
    'Free tool to identify every song in a DJ mix. Upload audio or video, get a full tracklist with song titles, artists, album covers, and a downloadable SRT subtitle file.',
};

export default function Home() {
  return <MixIdentifier />;
}
