// Design Ref: §5 lib/zip-builder.ts — Build ZIP from SRT + cover images
// Design Ref: §4 GET /api/download/[id] — ZIP contents: subtitles.srt + cover-NN.jpg
// Plan SC: ZIP download contains SRT + cover images (FR-06)

import archiver from 'archiver';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import type { Job } from '@/types';
import { buildSrt } from './srt-builder';

/**
 * Build the ZIP file for a completed job and write it to outputPath.
 * ZIP contents:
 *   mix-{jobId}/subtitles.srt
 *   mix-{jobId}/cover-01.jpg
 *   mix-{jobId}/cover-02.jpg
 *   …
 */
export async function buildZip(job: Job, outputPath: string): Promise<void> {
  const zipDir = `mix-${job.id}`;

  await new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 6 } });

    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);

    // 1. Add subtitles.srt and subtitles.ass
    const srtContent = buildSrt(job.tracks);
    archive.append(srtContent, { name: `${zipDir}/subtitles.srt` });

    // 2. Add cover images
    const usedNames = new Set<string>();
    for (const track of job.tracks) {
      if (!track.coverFilename) continue;
      const coverPath = path.join(job.workDir, track.coverFilename);
      // Only add if the file exists and has content (skip 0-byte placeholders)
      try {
        const stat = fs.statSync(coverPath);
        if (stat.size > 0) {
          const ext = path.extname(track.coverFilename) || '.jpg';
          const sanitize = (s: string) =>
            s.replace(/[/\\:*?"<>|]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
          let baseName = `${sanitize(track.title)}-${sanitize(track.artist)}${ext}`;
          // Deduplicate if same title+artist appears more than once
          if (usedNames.has(baseName)) {
            baseName = `${sanitize(track.title)}-${sanitize(track.artist)}-${track.index}${ext}`;
          }
          usedNames.add(baseName);
          archive.file(coverPath, { name: `${zipDir}/${baseName}` });
        }
      } catch {
        // File missing — skip silently
      }
    }

    archive.finalize();
  });
}

/**
 * Stream an existing ZIP file to a Node.js ServerResponse / Next.js response.
 * Returns a ReadableStream suitable for NextResponse bodies.
 */
export function createZipStream(zipPath: string): fs.ReadStream {
  return fs.createReadStream(zipPath);
}

/**
 * Clean up the job's working directory after the ZIP has been streamed.
 */
export async function cleanupWorkDir(workDir: string): Promise<void> {
  try {
    await fsp.rm(workDir, { recursive: true, force: true });
  } catch {
    // Best-effort cleanup — don't throw
  }
}
