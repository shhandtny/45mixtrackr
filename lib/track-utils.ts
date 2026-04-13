import type { Track } from '@/types';

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    // Remove known version/edit markers entirely (including brackets)
    .replace(/\s*[\[(]\s*(?:edit|radio edit|extended(?:\s+mix)?|original(?:\s+mix)?|album version|single version|remaster(?:ed)?(?:\s+\d{4})?|instrumental|45 version|\d+"\s*version|lp version|ep version|club mix|dub mix|acappella|a cappella|\d{4})\s*[)\]]/gi, '')
    // Also strip [anything containing "version", "mix", "edit", "remix", "remaster"]
    .replace(/\s*\[[^\]]*(?:version|mix|edit|remix|remaster)[^\]]*\]/gi, '')
    .replace(/\s*\([^)]*(?:version|mix|remaster)\)[^)]/gi, '')
    // Remove trailing " - Instrumental/Edit/etc" suffix
    .replace(/\s*-\s*(instrumental|radio edit|extended|remix|original|edit|remaster(?:ed)?|album version|single version)\s*$/i, '')
    // Remove remaining brackets but KEEP the text inside (e.g. "(I Like It)" → "I Like It")
    .replace(/[()[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeArtist(artist: string): string {
  return artist
    .toLowerCase()
    .replace(/\s*&\s*/g, ' and ')    // normalize & → and
    .split(/[;/]/)
    .map((a) => a.trim().replace(/^the\s+|^a\s+/i, ''))
    .sort()
    .join(';');
}

export function isSameArtist(a: string, b: string): boolean {
  const na = normalizeArtist(a);
  const nb = normalizeArtist(b);
  if (na === nb) return true;
  const setA = new Set(na.split(';'));
  const setB = new Set(nb.split(';'));
  const overlap = [...setA].filter((x) => setB.has(x));
  return overlap.length > 0 && (overlap.length === setA.size || overlap.length === setB.size);
}

/**
 * Merge consecutive segments that identify as the same song into one track.
 * Uses normalized title/artist comparison to catch variants like "(Edit)", "(Instrumental)".
 * Keeps the earliest startTime and latest endTime, re-numbers indices from 1.
 */
export function deduplicateConsecutive(tracks: Track[]): Track[] {
  if (tracks.length === 0) return [];

  const merged: Track[] = [];
  let current = { ...tracks[0] };

  for (let i = 1; i < tracks.length; i++) {
    const t = tracks[i];
    const sameRecognized = t.recognized === current.recognized;
    const sameTitle = normalizeTitle(t.title) === normalizeTitle(current.title);
    const sameArt = isSameArtist(t.artist, current.artist);

    if (sameRecognized && sameTitle && sameArt) {
      current.endTime = t.endTime;
    } else {
      merged.push(current);
      current = { ...t };
    }
  }
  merged.push(current);

  return merged.map((t, i) => ({ ...t, index: i + 1 }));
}
