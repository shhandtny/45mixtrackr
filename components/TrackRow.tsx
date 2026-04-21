'use client';

import { useState } from 'react';
import type { Track } from '@/types';

interface TrackRowProps {
  track: Track;
  displayIndex: number;
  isNew?: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function TrackRow({ track, displayIndex, isNew = false }: TrackRowProps) {
  const [lightbox, setLightbox] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <tr
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={[
          'group rounded-md transition-colors',
          hovered ? 'bg-[#ffffff12]' : '',
          isNew ? 'animate-fade-in' : '',
        ].join(' ')}
      >
        {/* Index */}
        <td className="pl-4 pr-2 py-2 w-10 text-right tabular-nums">
          <span className={hovered ? 'text-white text-sm' : 'text-[#6B6B6B] text-sm'}>
            {displayIndex}
          </span>
        </td>

        {/* Cover + Title + Artist */}
        <td className="px-4 py-2">
          <div className="flex items-center gap-3">
            {track.coverUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={track.coverUrl}
                alt={track.album || track.title}
                width={40}
                height={40}
                className="rounded w-10 h-10 object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setLightbox(true)}
              />
            ) : (
              <div className="w-10 h-10 rounded bg-spotify-hover flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
                </svg>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white font-medium text-sm leading-tight truncate max-w-xs">
                {track.title}
              </p>
              <p className="text-[#B3B3B3] text-xs mt-0.5 truncate max-w-xs">
                {track.artist}
              </p>
            </div>
          </div>
        </td>

        {/* Album */}
        <td className="px-4 py-2 hidden md:table-cell">
          <p className="text-[#B3B3B3] text-sm truncate max-w-[180px] hover:underline hover:text-white cursor-default transition-colors">
            {track.album || '—'}
          </p>
        </td>

        {/* Discogs */}
        <td className="px-2 py-2 hidden md:table-cell text-center">
          <a
            href={`https://www.discogs.com/search/?q=${encodeURIComponent(`${track.title} ${track.artist}`)}&type=release`}
            target="_blank"
            rel="noopener noreferrer"
            title="Search on Discogs"
            className="flex items-center justify-center w-6 h-6 rounded-full bg-[#FB923C] hover:bg-[#EA580C] transition-colors mx-auto"
          >
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </td>

        {/* Duration */}
        <td className="px-4 py-2 text-right text-[#B3B3B3] text-sm tabular-nums w-16">
          {formatTime(track.endTime)}
        </td>
      </tr>

      {/* Lightbox */}
      {lightbox && track.coverUrl && (
        <tr>
          <td colSpan={5} className="p-0">
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-pointer"
              onClick={() => setLightbox(false)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={track.coverUrl}
                alt={track.album || track.title}
                className="max-w-[80vw] max-h-[80vh] rounded-lg shadow-2xl"
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
