// Design Ref: §4 GET /api/download/[id] — stream ZIP and trigger cleanup
// Plan SC: ZIP download contains SRT + cover images (FR-06)

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getJob, deleteJob } from '@/lib/job-store';
import { cleanupWorkDir } from '@/lib/zip-builder';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = getJob(id);

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (job.status !== 'done') {
    return NextResponse.json(
      { error: `Job not ready: status is "${job.status}"` },
      { status: 409 }
    );
  }

  const zipPath = path.join(job.workDir, 'output.zip');

  // Verify ZIP exists
  try {
    await fs.promises.access(zipPath);
  } catch {
    return NextResponse.json({ error: 'ZIP file not found' }, { status: 500 });
  }

  const stat = await fs.promises.stat(zipPath);
  const filename = `mix-${id.slice(0, 8)}.zip`;

  // Stream ZIP as response body
  const fileStream = fs.createReadStream(zipPath);
  const readableStream = new ReadableStream({
    start(controller) {
      fileStream.on('data', (chunk) => controller.enqueue(chunk));
      fileStream.on('end', () => {
        controller.close();
        // Cleanup after stream ends
        deleteJob(id);
        cleanupWorkDir(job.workDir).catch(() => {});
      });
      fileStream.on('error', (err) => controller.error(err));
    },
    cancel() {
      fileStream.destroy();
    },
  });

  return new NextResponse(readableStream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(stat.size),
    },
  });
}
