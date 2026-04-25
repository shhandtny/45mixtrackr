'use client';
// Design Ref: §7 useJobPoller — poll /api/status every 2s, replace full track list each time

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Track, JobStatus } from '@/types';

const POLL_INTERVAL_MS = 2000;

interface PollerState {
  tracks: Track[];
  status: JobStatus | null;
  step: string;
  progress: { processed: number; total: number };
  error: string | null;
}

export function useJobPoller(jobId: string | null): PollerState {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [step, setStep] = useState('');
  const [progress, setProgress] = useState({ processed: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const stopRef = useRef(false);

  const poll = useCallback(async () => {
    if (!jobId || stopRef.current) return;
    try {
      const res = await fetch(`/api/status/${jobId}`);
      if (res.status === 404) { stopRef.current = true; setStatus('error'); setError('Job not found — please upload again.'); return; }
      if (!res.ok) return;
      const data = await res.json();

      setStatus(data.status);
      setStep(data.step ?? '');
      setProgress({ processed: data.processedSegments ?? 0, total: data.totalSegments ?? 0 });
      if (data.error) setError(data.error);
      if (Array.isArray(data.tracks)) setTracks(data.tracks);
    } catch {
      // Network error — keep polling
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;

    // Reset state when a new job starts
    stopRef.current = false;
    setTracks([]);
    setStatus(null);
    setStep('');
    setProgress({ processed: 0, total: 0 });
    setError(null);

    poll(); // immediate first poll

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [jobId, poll]);

  return { tracks, status, step, progress, error };
}
