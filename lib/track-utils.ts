import type { Track } from '@/types';

/**
 * Merge consecutive segments that identify as the same song into one track.
 * Keeps the earliest startTime and latest endTime, re-numbers indices from 1.
 */
export function deduplicateConsecutive(tracks: Track[]): Track[] {
  if (tracks.length === 0) return [];

  const merged: Track[] = [];
  let current = { ...tracks[0] };

  for (let i = 1; i < tracks.length; i++) {
    const t = tracks[i];
    const sameRecognized = t.recognized === current.recognized;
    const sameTitle = t.title.toLowerCase() === current.title.toLowerCase();
    const sameArtist = t.artist.toLowerCase() === current.artist.toLowerCase();

    if (sameRecognized && sameTitle && sameArtist) {
      current.endTime = t.endTime;
    } else {
      merged.push(current);
      current = { ...t };
    }
  }
  merged.push(current);

  return merged.map((t, i) => ({ ...t, index: i + 1 }));
}
