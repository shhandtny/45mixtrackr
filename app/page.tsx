import type { Metadata } from 'next';
import { MixIdentifier } from '@/components/MixIdentifier';

export const metadata: Metadata = {
  title: '45 Mix Trackr — Free DJ Mix Song Identifier & Tracklist Generator',
  description:
    'Free DJ mix tracklist generator. Upload any audio or video mix to identify every song instantly — get titles, artists, album covers, and a downloadable SRT subtitle file for YouTube.',
  alternates: { canonical: 'https://www.45mixtrackr.com' },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '45 Mix Trackr',
  url: 'https://www.45mixtrackr.com',
  description: 'Free DJ mix tracklist generator. Upload any audio or video mix to identify every song — get titles, artists, album covers, and an SRT subtitle file.',
  applicationCategory: 'MusicApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is 45 Mix Trackr free to use?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, 45 Mix Trackr is completely free. Upload any audio or video mix and get a full tracklist with song titles, artists, and album covers instantly.' },
    },
    {
      '@type': 'Question',
      name: 'What audio and video formats are supported?',
      acceptedAnswer: { '@type': 'Answer', text: 'We support MP3, MP4, WAV, M4A, and AAC files up to 500 MB.' },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to identify a DJ mix?',
      acceptedAnswer: { '@type': 'Answer', text: 'Most mixes are identified within 2–5 minutes depending on length. A one-hour mix typically takes around 3 minutes.' },
    },
    {
      '@type': 'Question',
      name: 'How accurate is the song recognition?',
      acceptedAnswer: { '@type': 'Answer', text: '45 Mix Trackr uses ACRCloud audio fingerprinting technology, which recognizes over 10 million songs. Most mainstream and popular tracks are identified accurately, even through DJ blends and transitions.' },
    },
    {
      '@type': 'Question',
      name: 'What is an SRT file and how do I use it for my DJ mix video?',
      acceptedAnswer: { '@type': 'Answer', text: 'An SRT file is a subtitle file. Import it into DaVinci Resolve, Premiere Pro, or Final Cut Pro to display song names as on-screen text in your DJ mix video, perfectly timed to when each track plays.' },
    },
    {
      '@type': 'Question',
      name: 'Can I identify songs in a vinyl DJ mix?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. 45 Mix Trackr works with any audio recording including vinyl mixes. As long as the tracks are in the ACRCloud database, they will be recognized.' },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MixIdentifier />
    </>
  );
}
