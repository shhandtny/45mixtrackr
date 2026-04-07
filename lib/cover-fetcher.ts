// Design Ref: §5 lib/cover-fetcher.ts — Download album cover images to workDir
// Plan SC: ZIP download contains SRT + cover images named cover-01.jpg … cover-N.jpg (FR-05, FR-06)

import fs from 'fs/promises';
import path from 'path';
import type { Track } from '@/types';

const PLACEHOLDER_COVER_SIZE = 0; // 0-byte file signals missing cover to ZIP builder

/**
 * Download all album cover images for the given tracks into workDir.
 * Files are named cover-01.jpg, cover-02.jpg, …
 *
 * - If coverUrl is null or the download fails, a 0-byte placeholder is written
 *   so the ZIP still includes the file slot (consistent naming).
 * - Sets track.coverFilename on each track in-place.
 */
export async function fetchCovers(tracks: Track[], workDir: string): Promise<void> {
  await fs.mkdir(workDir, { recursive: true });

  await Promise.all(
    tracks.map(async (track) => {
      const filename = `cover-${String(track.index).padStart(2, '0')}.jpg`;
      const outputPath = path.join(workDir, filename);
      track.coverFilename = filename;

      if (!track.coverUrl) {
        // Write empty placeholder so ZIP always has the slot
        await fs.writeFile(outputPath, Buffer.alloc(PLACEHOLDER_COVER_SIZE));
        return;
      }

      try {
        const response = await fetch(track.coverUrl, {
          signal: AbortSignal.timeout(10_000), // 10s timeout per image
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.writeFile(outputPath, buffer);
      } catch {
        // Silently fall back to placeholder — don't block ZIP creation
        await fs.writeFile(outputPath, Buffer.alloc(PLACEHOLDER_COVER_SIZE));
      }
    })
  );
}
