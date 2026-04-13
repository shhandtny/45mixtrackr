// Design Ref: §5 lib/srt-builder.ts — Generate SRT subtitle file from track list
// Design Ref: §5 SRT Format Specification — "Title - Artist" per entry, HH:MM:SS,mmm
// Plan SC: SRT file imports into DaVinci Resolve / Premiere with correct timecodes (FR-04)

import type { Track } from '@/types';
import { normalizeTitle, isSameArtist } from '@/lib/track-utils';

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
 * Title comparison is normalized to ignore common suffixes like "(Edit)".
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
      normalizeTitle(current.title) === normalizeTitle(next.title) &&
      isSameArtist(current.artist, next.artist);

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

  // Snap each entry's end time to the next entry's start time to prevent overlaps
  for (let i = 0; i < entries.length - 1; i++) {
    if (entries[i].endTime > entries[i + 1].startTime) {
      entries[i] = { ...entries[i], endTime: entries[i + 1].startTime };
    }
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
