import fs from 'fs/promises';
import path from 'path';
import { createServiceClient } from '@/lib/supabase/service';
import { buildSrt } from '@/lib/srt-builder';
import type { Job } from '@/types';

export async function persistJobToSupabase(job: Job): Promise<void> {
  if (!job.userId) return;

  const supabase = createServiceClient();
  const srtContent = buildSrt(job.tracks);
  const userId = job.userId;
  const jobId = job.id;

  // Upload SRT
  let srtPath: string | null = null;
  if (srtContent) {
    const srtKey = `${userId}/${jobId}/subtitles.srt`;
    const { error } = await supabase.storage
      .from('job-files')
      .upload(srtKey, Buffer.from(srtContent), { contentType: 'text/plain', upsert: true });
    if (!error) srtPath = srtKey;
  }

  // Upload ZIP
  let zipPath: string | null = null;
  const zipFilePath = path.join(job.workDir, 'output.zip');
  try {
    const zipBuffer = await fs.readFile(zipFilePath);
    const zipKey = `${userId}/${jobId}/output.zip`;
    const { error } = await supabase.storage
      .from('job-files')
      .upload(zipKey, zipBuffer, { contentType: 'application/zip', upsert: true });
    if (!error) zipPath = zipKey;
  } catch {
    // ZIP may not exist if packaging failed
  }

  const recognizedTracks = job.tracks.filter((t) => t.recognized);

  await supabase.from('jobs').upsert({
    id: jobId,
    user_id: userId,
    file_name: job.fileName ?? 'unknown',
    status: 'done',
    track_count: recognizedTracks.length,
    result_json: job.tracks,
    srt_path: srtPath,
    zip_path: zipPath,
  });
}
