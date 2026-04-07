// Design Ref: §4 POST /api/upload — receive file, start recognition job
// Plan SC: user can upload audio/video file up to 500 MB (FR-01)
// NOTE: On Vercel, request body is limited to 4.5 MB. For larger files in production,
// use a presigned upload URL approach (documented risk in Plan §8).

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { createJob } from '@/lib/job-store';
import { recognitionPipeline } from '@/lib/recognition-pipeline';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes (Vercel Pro/Enterprise)

const ALLOWED_TYPES = new Set([
  'audio/mpeg',         // mp3
  'audio/mp4',          // m4a
  'audio/wav',          // wav
  'audio/x-wav',
  'video/mp4',          // mp4
  'audio/x-m4a',
  'audio/aac',
]);

const ALLOWED_EXTENSIONS = new Set(['.mp3', '.mp4', '.wav', '.m4a', '.aac']);

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Failed to parse form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file field' }, { status: 400 });
  }

  // Validate file type
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext) && !ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type || ext}` },
      { status: 415 }
    );
  }

  // Write file to /tmp/{jobId}/input.ext
  const jobId = uuidv4();
  const workDir = path.join(os.tmpdir(), jobId);
  await fs.mkdir(workDir, { recursive: true });

  const inputPath = path.join(workDir, `input${ext}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(inputPath, buffer);

  // Create job and fire pipeline asynchronously
  const job = createJob(jobId, inputPath, workDir);

  // Fire-and-forget: do not await
  recognitionPipeline(job).catch((err) => {
    console.error(`Pipeline error for job ${jobId}:`, err);
  });

  return NextResponse.json({ jobId }, { status: 200 });
}
