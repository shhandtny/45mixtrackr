// Design Ref: §5 lib/job-store.ts — In-memory Map<jobId, Job>
// Plan SC: no DB needed for MVP; single-instance acceptable

import type { Job, JobStatus, Track } from '@/types';

// Use a global singleton so all API route module instances share one Map.
// Next.js dev mode re-evaluates modules per route; without this, upload creates
// a job in one Map instance and status/download read from a different empty Map.
declare global {
  // eslint-disable-next-line no-var
  var _jobStore: Map<string, Job> | undefined;
}

const jobs: Map<string, Job> = global._jobStore ?? (global._jobStore = new Map());

export function createJob(
  id: string,
  inputPath: string,
  workDir: string,
  userId?: string,
  fileName?: string,
): Job {
  const job: Job = {
    id,
    status: 'uploading',
    inputPath,
    workDir,
    tracks: [],
    totalSegments: 0,
    processedSegments: 0,
    createdAt: Date.now(),
    userId,
    fileName,
  };
  jobs.set(id, job);
  return job;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function updateJob(id: string, patch: Partial<Job>): void {
  const job = jobs.get(id);
  if (!job) return;
  jobs.set(id, { ...job, ...patch });
}

export function setJobStatus(id: string, status: JobStatus, error?: string): void {
  updateJob(id, error ? { status, error } : { status });
}

export function addTrack(id: string, track: Track): void {
  const job = jobs.get(id);
  if (!job) return;
  job.tracks.push(track);
}

export function incrementProcessed(id: string): void {
  const job = jobs.get(id);
  if (!job) return;
  job.processedSegments += 1;
}

/** Returns tracks with index > afterIndex (for incremental polling) */
export function getNewTracks(id: string, afterIndex: number): Track[] {
  const job = jobs.get(id);
  if (!job) return [];
  return job.tracks.filter((t) => t.index > afterIndex);
}

/** Remove job and free memory (called after ZIP is streamed) */
export function deleteJob(id: string): void {
  jobs.delete(id);
}
