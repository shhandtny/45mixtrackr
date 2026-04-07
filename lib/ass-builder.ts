// ASS (Advanced SubStation Alpha) subtitle builder
// Supported by Premiere Pro, DaVinci Resolve, VLC, and most NLEs.
// Gives full control over font, size, color, bold, position.

import type { Track } from '@/types';

/**
 * Convert seconds to ASS timecode format: H:MM:SS.cc (centiseconds)
 */
function toAssTime(totalSeconds: number): string {
  const cs = Math.round((totalSeconds % 1) * 100);
  const s = Math.floor(totalSeconds) % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

function mergeConsecutiveDuplicates(tracks: Track[]): Track[] {
  const recognized = tracks.filter((t) => t.recognized);
  if (recognized.length === 0) return [];

  const merged: Track[] = [];
  let current = { ...recognized[0] };

  for (let i = 1; i < recognized.length; i++) {
    const next = recognized[i];
    const same =
      current.title.toLowerCase() === next.title.toLowerCase() &&
      current.artist.toLowerCase() === next.artist.toLowerCase();
    if (same) {
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
 * Build a complete .ass subtitle string from a track list.
 *
 * Default style: Arial 48px, white, not bold, black outline — clean for DJ mixes.
 * To customise: change the Style line values below.
 *
 * ASS colour format: &HAABBGGRR (alpha, blue, green, red — reversed from HTML)
 */
export function buildAss(tracks: Track[]): string {
  const entries = mergeConsecutiveDuplicates(tracks);

  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,48,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,60,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

  if (entries.length === 0) return header + '\n';

  const dialogues = entries
    .map((track) => {
      const start = toAssTime(track.startTime);
      const end = toAssTime(track.endTime);
      const text = `${track.title} - ${track.artist}`;
      return `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`;
    })
    .join('\n');

  return header + '\n' + dialogues + '\n';
}
