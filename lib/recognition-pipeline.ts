// Design Ref: §5 lib/recognition-pipeline.ts — Orchestrate segment → identify → package
// Plan SC: backend splits recording into overlapping segments and sends to ACRCloud (FR-02, FR-03)

import fs from 'fs/promises';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import type { Job, Track } from '@/types';
import { updateJob, setJobStatus, addTrack, incrementProcessed, getJob } from './job-store';
import { segmentAudio } from './ffmpeg-segmenter';
import { identifySegment, extractTrackMeta, type ACRCloudConfig } from './acr-cloud';
import { fetchCovers } from './cover-fetcher';
import { buildZip } from './zip-builder';
import { deduplicateConsecutive } from './track-utils';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ffmpegPath: string = require('ffmpeg-static');
const execFileAsync = promisify(execFile);

/** Max parallel ACRCloud requests (stay within rate limits) */
const ACR_CONCURRENCY = 3;
const COMPRESS_THRESHOLD_BYTES = 100 * 1024 * 1024; // 100 MB

/**
 * If the input file exceeds 100 MB, re-encode it to 96kbps mono MP3
 * and return the path to the compressed file. Otherwise returns inputPath as-is.
 */
async function compressIfLarge(inputPath: string, workDir: string): Promise<string> {
  const { size } = await fs.stat(inputPath);
  if (size <= COMPRESS_THRESHOLD_BYTES) return inputPath;

  const compressedPath = path.join(workDir, 'input_compressed.mp3');
  await execFileAsync(ffmpegPath, [
    '-y',
    '-i', inputPath,
    '-vn',
    '-ar', '44100',
    '-ac', '1',
    '-b:a', '96k',
    '-f', 'mp3',
    compressedPath,
  ]);
  return compressedPath;
}

/**
 * Fetch album cover URL from iTunes Search API as a fallback.
 * Free, no auth required. Returns null if nothing found.
 */
async function itunesCoverUrl(title: string, artist: string): Promise<string | null> {
  try {
    const q = encodeURIComponent(`${title} ${artist}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${q}&entity=musicTrack&limit=5`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;
    const data = await res.json() as {
      results?: Array<{ artworkUrl100?: string; trackName?: string; artistName?: string }>
    };
    if (!data.results?.length) return null;
    // Pick the result whose title+artist most closely matches
    const titleLower = title.toLowerCase();
    const artistLower = artist.toLowerCase();
    const best = data.results.find(
      (r) =>
        r.trackName?.toLowerCase().includes(titleLower) &&
        r.artistName?.toLowerCase().includes(artistLower)
    ) ?? data.results[0];
    if (!best?.artworkUrl100) return null;
    return best.artworkUrl100.replace('100x100bb', '600x600bb');
  } catch {
    return null;
  }
}



function getAcrConfig(): ACRCloudConfig {
  const host = process.env.ACR_HOST;
  const accessKey = process.env.ACR_ACCESS_KEY;
  const accessSecret = process.env.ACR_ACCESS_SECRET;

  if (!host || !accessKey || !accessSecret) {
    throw new Error('Missing ACRCloud env vars: ACR_HOST, ACR_ACCESS_KEY, ACR_ACCESS_SECRET');
  }
  return { host, accessKey, accessSecret };
}

/**
 * Main pipeline: segment → identify → fetch covers → build ZIP.
 * Updates job status and track list in job-store throughout.
 * Runs asynchronously — fire-and-forget from the upload route.
 */
export async function recognitionPipeline(job: Job): Promise<void> {
  try {
    const config = getAcrConfig();

    // Phase 1: Segment audio (compress first if > 100 MB)
    setJobStatus(job.id, 'segmenting');
    const chunksDir = path.join(job.workDir, 'chunks');
    const inputPath = await compressIfLarge(job.inputPath, job.workDir);
    // 30s chunks, 0s overlap → balance between speed and timestamp precision
    const segments = await segmentAudio(inputPath, chunksDir, 30, 5);
    updateJob(job.id, { totalSegments: segments.length });

    // Phase 2: Identify segments in parallel batches
    setJobStatus(job.id, 'identifying');

    // Process in batches of ACR_CONCURRENCY; within each batch results are
    // inserted in segment order so deduplication stays correct.
    for (let i = 0; i < segments.length; i += ACR_CONCURRENCY) {
      const batch = segments.slice(i, i + ACR_CONCURRENCY);

      const results = await Promise.all(
        batch.map(async (segment) => {
          try {
            const buffer = await fs.readFile(segment.path);
            const result = await identifySegment(buffer, config);
            const meta = extractTrackMeta(result);
            let coverUrl = meta?.coverUrl ?? null;
            if (!coverUrl && meta) {
              coverUrl = await itunesCoverUrl(meta.title, meta.artist);
            }
            await fs.unlink(segment.path).catch(() => {});
            return { segment, meta, coverUrl };
          } catch {
            await fs.unlink(segment.path).catch(() => {});
            return { segment, meta: null, coverUrl: null };
          }
        })
      );

      for (const { segment, meta, coverUrl } of results) {
        const index = segments.indexOf(segment) + 1;
        const track: Track = {
          index,
          title: meta?.title ?? 'Unrecognized',
          artist: meta?.artist ?? '—',
          album: meta?.album ?? '',
          startTime: segment.startTime,
          endTime: segment.endTime,
          coverUrl,
          coverFilename: '',
          recognized: meta !== null,
        };

        addTrack(job.id, track);
        incrementProcessed(job.id);
      }
    }

    // Phase 3: Deduplicate consecutive same-song segments, then fetch covers + build ZIP
    setJobStatus(job.id, 'packaging');

    const currentJob = getJob(job.id);
    if (!currentJob) throw new Error('Job not found after identification');

    const dedupedTracks = deduplicateConsecutive(currentJob.tracks);
    updateJob(job.id, { tracks: dedupedTracks });

    await fetchCovers(dedupedTracks, job.workDir);

    const zipPath = path.join(job.workDir, 'output.zip');
    await buildZip({ ...currentJob, tracks: dedupedTracks }, zipPath);

    setJobStatus(job.id, 'done');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    setJobStatus(job.id, 'error', message);
  }
}
