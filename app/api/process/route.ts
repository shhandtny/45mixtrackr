import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import os from 'os';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { createServerClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createJob } from '@/lib/job-store';
import { recognitionPipeline } from '@/lib/recognition-pipeline';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const { jobId, storageKey, fileName } = await request.json();
  if (!jobId || !storageKey) {
    return NextResponse.json({ error: 'Missing jobId or storageKey' }, { status: 400 });
  }

  // Verify the storageKey belongs to this user
  if (!storageKey.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ext = path.extname(storageKey);
  const workDir = path.join(os.tmpdir(), jobId);
  await fs.mkdir(workDir, { recursive: true });
  const inputPath = path.join(workDir, `input${ext}`);

  // Create job immediately so status polling works
  const job = createJob(jobId, inputPath, workDir, user.id, fileName ?? 'upload');

  // Download from Supabase Storage and run pipeline asynchronously
  const service = createServiceClient();

  (async () => {
    try {
      const { data: blob, error } = await service.storage
        .from('job-files')
        .download(storageKey);

      if (error || !blob) throw new Error('File not found in storage');

      // Stream blob to disk
      const nodeStream = Readable.fromWeb(blob.stream() as import('stream/web').ReadableStream);
      const fileStream = createWriteStream(inputPath);
      await pipeline(nodeStream, fileStream);

      await recognitionPipeline(job);
    } catch (err) {
      console.error(`Process error for job ${jobId}:`, err);
    }
  })();

  return NextResponse.json({ jobId }, { status: 200 });
}
