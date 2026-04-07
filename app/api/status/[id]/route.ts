// Design Ref: §4 GET /api/status/[id] — job progress + full track list

import { NextResponse } from 'next/server';
import { getJob } from '@/lib/job-store';
import { deduplicateConsecutive } from '@/lib/track-utils';

export const runtime = 'nodejs';

const STEP_LABELS: Record<string, string> = {
  uploading:   'Uploading file…',
  segmenting:  'Splitting audio into segments…',
  identifying: 'Identifying songs…',
  packaging:   'Packaging download…',
  done:        'Done',
  error:       'Error',
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = getJob(id);

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  let step = STEP_LABELS[job.status] ?? job.status;
  if (job.status === 'identifying') {
    step = 'Identifying songs…';
  }

  return NextResponse.json({
    status: job.status,
    step,
    processedSegments: job.processedSegments,
    totalSegments: job.totalSegments,
    tracks: deduplicateConsecutive(job.tracks),
    ...(job.error ? { error: job.error } : {}),
  });
}
