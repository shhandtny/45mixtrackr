// Design Ref: §4 GET /api/result/[id] — return full track list JSON

import { NextResponse } from 'next/server';
import { getJob } from '@/lib/job-store';

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

  return NextResponse.json({ tracks: job.tracks });
}
