// Local BPM detection from audio chunks using music-tempo
// Used as fallback when ACRCloud doesn't return tempo (free tier)

import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ffmpegPath: string = require('ffmpeg-static');
const execFileAsync = promisify(execFile);

/**
 * Detect BPM from an audio file (MP3/WAV/etc).
 * Converts to raw PCM via ffmpeg, then analyzes with music-tempo.
 * Returns rounded BPM or null on failure.
 */
export async function detectBpm(audioPath: string): Promise<number | null> {
  const tmpPcm = path.join(os.tmpdir(), `bpm-${Date.now()}-${Math.random().toString(36).slice(2)}.raw`);
  try {
    // Convert audio to raw 32-bit float PCM, mono, 44100 Hz
    await execFileAsync(ffmpegPath, [
      '-y', '-i', audioPath,
      '-f', 'f32le', '-ar', '44100', '-ac', '1',
      tmpPcm,
    ]);

    const buffer = await fs.readFile(tmpPcm);
    const float32 = new Float32Array(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength / 4
    );

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MusicTempo } = require('music-tempo');
    const mt = new MusicTempo(float32);
    const bpm = Math.round(mt.tempo);
    return bpm > 0 ? bpm : null;
  } catch {
    return null;
  } finally {
    await fs.unlink(tmpPcm).catch(() => {});
  }
}
