// Design Ref: §5 lib/srt-builder.ts — Generate SRT subtitle file from track list
// Design Ref: §5 SRT Format Specification — "Title - Artist" per entry, HH:MM:SS,mmm
// Plan SC: SRT file imports into DaVinci Resolve / Premiere with correct timecodes (FR-04)

import type { Track } from '@/types';

/**
 * Convert seconds (float) to SRT timecode format: HH:MM:SS,mmm
 */
function toSrtTime(totalSeconds: number): string {
  const ms = Math.round((totalSeconds % 1) * 1000);
  const s = Math.floor(totalSeconds) % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600);
  return [
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0'),
  ].join(':') + ',' + String(ms).padStart(3, '0');
}

/**
 * Merge consecutive duplicate tracks (same title + artist).
 * The merged entry spans from the first start to the last end time.
 * Unrecognized segments are excluded from the SRT output.
 */
function mergeConsecutiveDuplicates(tracks: Track[]): Track[] {
  const recognized = tracks.filter((t) => t.recognized);
  if (recognized.length === 0) return [];

  const merged: Track[] = [];
  let current = { ...recognized[0] };

  for (let i = 1; i < recognized.length; i++) {
    const next = recognized[i];
    const sameTrack =
      current.title.toLowerCase() === next.title.toLowerCase() &&
      current.artist.toLowerCase() === next.artist.toLowerCase();

    if (sameTrack) {
      // Extend end time of current segment
      current.endTime = next.endTime;
    } else {
      merged.push(current);
      current = { ...next };
    }
  }
  merged.push(current);
  return merged;
}

/**
 * Build a complete .srt subtitle string from a track list.
 * Unrecognized segments are excluded; consecutive duplicates are merged.
 *
 * Output format:
 * ```
 * 1
 * 00:00:00,000 --> 00:03:24,000
 * Lose Yourself - Eminem
 *
 * 2
 * 00:03:24,000 --> 00:06:47,000
 * Blinding Lights - The Weeknd
 * ```
 */
export function buildSrt(tracks: Track[]): string {
  const entries = mergeConsecutiveDuplicates(tracks);

  if (entries.length === 0) {
    return ''; // no recognized tracks
  }

  return entries
    .map((track, i) => {
      const start = toSrtTime(track.startTime);
      const end = toSrtTime(track.endTime);
      const text = `${track.title} - ${track.artist}`;
      return `${i + 1}\n${start} --> ${end}\n${text}`;
    })
    .join('\n\n') + '\n';
}
