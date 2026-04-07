import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'About — 45 Mix Trackr',
  description:
    'Learn how 45 Mix Trackr works. A free audio fingerprinting tool that identifies every song in a DJ mix and generates tracklists with album covers and SRT subtitle files.',
};

export default function AboutPage() {
  return (
    <PageShell>
    <div className="max-w-3xl text-white">
      <h1 className="text-3xl font-bold mb-4">About 45 Mix Trackr</h1>

      <section className="space-y-6 text-[#B3B3B3] leading-relaxed">

        <p className="text-lg text-white">
          A free tool built for DJs, music producers, and content creators who need to identify
          every song in a mix — fast.
        </p>

        <p>
          Whether you&apos;re uploading a recorded DJ set to YouTube, creating a tracklist for your
          podcast, or organizing your archive of old mixes, 45 Mix Trackr does the heavy lifting.
          Just upload your audio or video file and get back a complete tracklist with song titles,
          artists, and album artwork — all in one click.
        </p>

        <div>
          <h2 className="text-white text-lg font-semibold mb-2">What It Does</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Identifies songs in audio and video mixes using audio fingerprinting</li>
            <li>Returns song title, artist name, and album cover for each recognized track</li>
            <li>Generates a downloadable SRT subtitle file for use in DaVinci Resolve, Premiere Pro, and other editors</li>
            <li>Packages all album covers into a single ZIP file for easy download</li>
            <li>Supports MP3, MP4, WAV, M4A, and AAC files up to 500 MB</li>
          </ul>
        </div>

        <div>
          <h2 className="text-white text-lg font-semibold mb-2">How It Works</h2>
          <p>
            Your uploaded file is split into 30-second audio segments. Each segment is sent to
            ACRCloud — a leading audio fingerprinting platform trusted by broadcasters and
            streaming services worldwide — for identification. Results are returned in real time
            as each segment is processed.
          </p>
          <p className="mt-2">
            Album artwork is sourced from Spotify metadata (via ACRCloud) and the Apple iTunes
            Search API. Files are processed on secure servers and deleted automatically after
            your session ends.
          </p>
        </div>

        <div>
          <h2 className="text-white text-lg font-semibold mb-2">Who It&apos;s For</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>DJs who want to publish tracklists for their recorded sets</li>
            <li>Video editors who need timestamped subtitles showing song names</li>
            <li>Podcast creators who play background music and need attribution</li>
            <li>Music lovers who want to identify songs from a recorded mix</li>
          </ul>
        </div>

        <div>
          <h2 className="text-white text-lg font-semibold mb-2">Built With</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Next.js — web framework</li>
            <li>ACRCloud — audio fingerprinting and song recognition</li>
            <li>ffmpeg — audio segmentation and compression</li>
            <li>Apple iTunes Search API — album artwork fallback</li>
          </ul>
        </div>

        <p>
          Have questions or feedback?{' '}
          <a href="/contact" className="text-orange-400 underline">Get in touch</a>.
        </p>

      </section>
    </div>
    </PageShell>
  );
}
