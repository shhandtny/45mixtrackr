// Design Ref: §4 POST /api/upload — receive file, start recognition job
// Plan SC: user can upload audio/video file up to 500 MB (FR-01)

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { Readable } from 'stream';
import type { IncomingMessage } from 'http';
import { v4 as uuidv4 } from 'uuid';
import formidable from 'formidable';
import { createJob } from '@/lib/job-store';
import { recognitionPipeline } from '@/lib/recognition-pipeline';
import { createServerClient } from '@/lib/supabase/server';
import { checkAndIncrementUsage } from '@/lib/usage';

export const runtime = 'nodejs';
export const maxDuration = 300;

const ALLOWED_EXTENSIONS = new Set(['.mp3', '.mp4', '.wav', '.m4a', '.aac']);

function parseMultipart(req: IncomingMessage, uploadDir: string): Promise<{ name: string; path: string; ext: string }> {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 500 * 1024 * 1024,
      maxFiles: 1,
    });

    form.parse(req, (err, _fields, files) => {
      if (err) return reject(err);
      const fileField = files['file'];
      const file = Array.isArray(fileField) ? fileField[0] : fileField;
      if (!file) return reject(new Error('Missing file field'));
      const ext = path.extname(file.originalFilename ?? '').toLowerCase();
      resolve({ name: file.originalFilename ?? 'input', path: file.filepath, ext });
    });
  });
}

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  }

  // Usage limit check
  const usage = await checkAndIncrementUsage(user.id);
  if (!usage.allowed) {
    return NextResponse.json({ error: 'limit_reached', count: usage.count, limit: usage.limit }, { status: 403 });
  }

  const jobId = uuidv4();
  const workDir = path.join(os.tmpdir(), jobId);
  await fs.mkdir(workDir, { recursive: true });

  let fileName: string;
  let inputPath: string;

  try {
    // Read request.body directly — bypasses Next.js 10MB body parser limit
    const nodeStream = Readable.fromWeb(request.body as import('stream/web').ReadableStream);
    const fakeReq = Object.assign(nodeStream, {
      headers: {
        'content-type': request.headers.get('content-type') ?? '',
        'content-length': request.headers.get('content-length') ?? '',
      },
      method: 'POST',
      url: '/api/upload',
    }) as unknown as IncomingMessage;

    const parsed = await parseMultipart(fakeReq, workDir);

    if (!ALLOWED_EXTENSIONS.has(parsed.ext)) {
      return NextResponse.json({ error: `Unsupported file type: ${parsed.ext}` }, { status: 415 });
    }

    fileName = parsed.name;

    // Rename formidable's temp file to input.ext
    inputPath = path.join(workDir, `input${parsed.ext}`);
    await fs.rename(parsed.path, inputPath);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 400 });
  }

  const job = createJob(jobId, inputPath, workDir, user.id, fileName);

  recognitionPipeline(job).catch((err) => {
    console.error(`Pipeline error for job ${jobId}:`, err);
  });

  return NextResponse.json({ jobId }, { status: 200 });
}
