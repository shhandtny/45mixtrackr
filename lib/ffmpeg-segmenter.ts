// Design Ref: §5 lib/ffmpeg-segmenter.ts — Split audio into overlapping chunks
// Design Ref: §6 ACRCloud Integration — 10s chunks, 5s overlap
// Plan SC: backend splits the recording into overlapping segments (FR-02)

import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

// ffmpeg-static provides the binary path; must be external package on Vercel
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ffmpegPath: string = require('ffmpeg-static');

const execFileAsync = promisify(execFile);

export interface Segment {
  path: string;
  startTime: number; // seconds
  endTime: number;   // seconds
}

/**
 * Get the total duration of an audio/video file in seconds.
 * ffmpeg always writes file info to stderr, even on successful probe.
 */
function getDuration(inputPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    let stderr = '';
    const proc = spawn(ffmpegPath, ['-i', inputPath]);
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
    proc.on('close', () => {
      const match = stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.?\d*)/);
      if (!match) {
        reject(new Error(`Could not determine duration of ${inputPath}`));
        return;
      }
      const [, h, m, s] = match;
      resolve(Number(h) * 3600 + Number(m) * 60 + Number(s));
    });
  });
}

/**
 * Split an audio/video file into overlapping segments for ACRCloud fingerprinting.
 *
 * @param inputPath   - Absolute path to input file
 * @param outputDir   - Directory to write chunk files
 * @param segmentDuration - Length of each chunk in seconds (default 10)
 * @param overlap     - Overlap between consecutive chunks in seconds (default 5)
 * @returns           - Array of segment descriptors sorted by startTime
 */
const FFMPEG_CONCURRENCY = 1;

export async function segmentAudio(
  inputPath: string,
  outputDir: string,
  segmentDuration = 30,
  overlap = 10
): Promise<Segment[]> {
  await fs.mkdir(outputDir, { recursive: true });

  const totalDuration = await getDuration(inputPath);
  const step = segmentDuration - overlap;

  // Build list of all segment positions
  const positions: { start: number; end: number; index: number }[] = [];
  let start = 0;
  let index = 0;
  while (start < totalDuration) {
    positions.push({ start, end: Math.min(start + segmentDuration, totalDuration), index });
    start += step;
    index += 1;
  }

  // Run ffmpeg extractions in parallel batches (faster than sequential)
  for (let i = 0; i < positions.length; i += FFMPEG_CONCURRENCY) {
    const batch = positions.slice(i, i + FFMPEG_CONCURRENCY);
    await Promise.all(batch.map(({ start, end, index }) => {
      const chunkPath = path.join(outputDir, `chunk-${String(index).padStart(4, '0')}.mp3`);
      return execFileAsync(ffmpegPath, [
        '-y',
        '-ss', String(start),
        '-i', inputPath,
        '-t', String(end - start),
        '-vn',
        '-ar', '44100',
        '-ac', '1',
        '-b:a', '128k',
        '-f', 'mp3',
        chunkPath,
      ]);
    }));
  }

  return positions.map(({ start, end, index }) => ({
    path: path.join(outputDir, `chunk-${String(index).padStart(4, '0')}.mp3`),
    startTime: start,
    endTime: end,
  }));
}
