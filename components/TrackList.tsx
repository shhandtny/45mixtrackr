'use client';

import type { Track } from '@/types';
import { normalizeTitle, normalizeArtist } from '@/lib/track-utils';
import { TrackRow } from './TrackRow';

interface TrackListProps {
  tracks: Track[];
  newTrackIndices: Set<number>;
}

export function TrackList({ tracks, newTrackIndices }: TrackListProps) {
  const seen = new Set<string>();
  const recognized = tracks.filter((t) => {
    if (!t.recognized || !t.coverUrl) return false;
    const key = `${normalizeTitle(t.title)}|${normalizeArtist(t.artist)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (recognized.length === 0) return null;

  return (
    <div className="w-full mt-2 pb-8">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#282828] text-xs uppercase tracking-widest text-[#6B6B6B]">
            <th className="pl-4 pr-2 pb-3 text-right w-10 font-normal">#</th>
            <th className="px-4 pb-3 text-left font-normal">Title</th>
            <th className="px-4 pb-3 text-left font-normal hidden md:table-cell">Album</th>
            <th className="px-2 pb-3 text-center font-normal hidden md:table-cell text-[#6B6B6B] whitespace-nowrap">Find on Discogs</th>
            <th className="px-4 pb-3 text-right font-normal w-16">
              {/* Clock icon */}
              <svg className="w-4 h-4 inline text-[#6B6B6B]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
              </svg>
            </th>
          </tr>
        </thead>
        <tbody>
          {recognized.map((track, i) => (
            <TrackRow
              key={track.index}
              track={track}
              displayIndex={i + 1}
              isNew={newTrackIndices.has(track.index)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
