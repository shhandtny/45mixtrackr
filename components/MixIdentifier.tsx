'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { UploadZone } from './UploadZone';
import { ProcessingStatus } from './ProcessingStatus';
import { TrackList } from './TrackList';
import { DownloadButton } from './DownloadButton';
import { useJobPoller } from '@/hooks/useJobPoller';

export function MixIdentifier() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [mixName, setMixName] = useState<string>('Your Mix');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { tracks, status, step, progress, error } = useJobPoller(jobId);

  const newIndicesRef = useRef<Set<number>>(new Set());
  const prevTrackCountRef = useRef(0);

  useEffect(() => {
    if (tracks.length > prevTrackCountRef.current) {
      const fresh = new Set<number>();
      for (let i = prevTrackCountRef.current; i < tracks.length; i++) {
        fresh.add(tracks[i].index);
      }
      newIndicesRef.current = fresh;
      prevTrackCountRef.current = tracks.length;
      setTimeout(() => { newIndicesRef.current = new Set(); }, 600);
    }
  }, [tracks]);

  const isProcessing = jobId !== null && status !== 'done' && status !== 'error';
  const isDone = status === 'done';
  const recognizedTracks = tracks.filter((t) => t.recognized && t.coverUrl);
  const coverUrl = recognizedTracks[0]?.coverUrl ?? null;

  function handleJobId(id: string, fileName: string) {
    setJobId(id);
    setMixName(fileName.replace(/\.[^.]+$/, ''));
    setSidebarOpen(false);
  }

  function handleReset() {
    setJobId(null);
    setMixName('Your Mix');
    prevTrackCountRef.current = 0;
    newIndicesRef.current = new Set();
  }

  const navLinks = [
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-black">

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Left Sidebar ── */}
      <aside className={[
        'fixed md:static z-30 top-0 left-0 h-full w-64 flex-shrink-0 flex flex-col bg-black transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ].join(' ')}>
        {/* Logo */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="45 Mix Trackr" className="w-8 h-8 object-contain flex-shrink-0 rounded" />
            <span className="font-synthemesc text-white text-xl leading-tight tracking-wide">mixtrackr</span>
          </div>
          {/* Close button (mobile only) */}
          <button
            className="md:hidden text-[#B3B3B3] hover:text-white p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Your Library */}
        <div className="mx-2 rounded-lg bg-spotify-surface flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2 text-[#B3B3B3]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 18v-2h18v2H3zm0-5v-2h18v2H3zm0-5V6h18v2H3z"/>
            </svg>
            <span className="text-sm font-bold">Your Library</span>
          </div>

          <div className="px-2 pb-2 flex-1 overflow-y-auto">
            {!jobId ? (
              <div className="bg-spotify-hover rounded-lg p-4 mt-1">
                <p className="text-white text-sm font-bold mb-1">Identify a mix</p>
                <p className="text-[#B3B3B3] text-xs mb-3 leading-relaxed">
                  Upload an audio or video file to get a full tracklist.
                </p>
                <UploadZone onJobId={handleJobId} disabled={isProcessing} compact />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-2 rounded-md bg-spotify-hover mt-1 cursor-default">
                {coverUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={coverUrl} alt="cover" className="w-10 h-10 rounded flex-shrink-0 object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded bg-spotify-dim flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
                    </svg>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{mixName}</p>
                  <p className="text-[#B3B3B3] text-xs mt-0.5">
                    {isDone ? `${recognizedTracks.length} songs` : isProcessing ? 'Identifying…' : '—'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom nav links */}
        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="text-[10px] text-[#6B6B6B] hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </div>
          <a href="mailto:contact@45mixtrackr.com" className="block text-[10px] text-[#6B6B6B] hover:text-white transition-colors mt-2">
            contact@45mixtrackr.com
          </a>
          <p className="text-[10px] text-[#6B6B6B] mt-1">© {new Date().getFullYear()} <span className="font-synthemesc">45mixtrackr</span></p>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-spotify-black md:rounded-lg md:m-2 md:ml-0">

        {/* Mobile top bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-spotify-surface md:hidden flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#B3B3B3] hover:text-white p-1"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 18v-2h18v2H3zm0-5v-2h18v2H3zm0-5V6h18v2H3z"/>
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="45 Mix Trackr" className="w-6 h-6 object-contain rounded" />
            <span className="font-synthemesc text-white text-sm tracking-wide">mixtrackr</span>
          </div>
        </div>

        {/* Gradient header */}
        <div
          className="relative flex-shrink-0 px-4 md:px-8 pt-16 md:pt-24 pb-8 min-h-48 md:min-h-64"
          style={{
            backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, #121212 100%), url(/images/mainbanner.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {jobId ? (
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
              {/* Cover art */}
              <div className="w-36 h-36 sm:w-48 sm:h-48 flex-shrink-0 shadow-2xl rounded">
                {coverUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={coverUrl} alt="Mix cover" className="w-full h-full object-cover rounded" />
                ) : (
                  <div className="w-full h-full bg-spotify-hover rounded flex items-center justify-center">
                    <svg className="w-12 h-12 sm:w-16 sm:h-16 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Mix info */}
              <div className="min-w-0 text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-white mb-1 sm:mb-2">Mix</p>
                <h1 className="text-3xl sm:text-5xl font-black text-white mb-2 sm:mb-4 truncate max-w-xs sm:max-w-none">{mixName}</h1>
                <p className="text-[#B3B3B3] text-sm">
                  <span className="font-synthemesc">45mixtrackr</span>
                  {isDone && recognizedTracks.length > 0 && (
                    <> &bull; {recognizedTracks.length} song{recognizedTracks.length !== 1 ? 's' : ''}</>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="font-synthemesc text-3xl md:text-4xl text-white">45mixtrackr</h1>
              <p className="text-[#B3B3B3] mt-2 text-sm">
                Upload your mix to identify every song — get titles, artists, album covers, and an SRT subtitle file.
              </p>
            </div>
          )}
        </div>

        {/* Controls bar */}
        {jobId && (
          <div className="px-4 md:px-8 py-4 flex items-center gap-4 sm:gap-6 flex-shrink-0">
            {isDone ? (
              <>
                <DownloadButton jobId={jobId} ready={isDone} trackCount={recognizedTracks.length} inline />
                <button
                  onClick={handleReset}
                  className="bg-spotify-surface hover:bg-spotify-hover border border-[#535353] hover:border-[#B3B3B3] text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
                >
                  Identify another mix
                </button>
              </>
            ) : (
              <ProcessingStatus step={step} processed={progress.processed} total={progress.total} />
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 md:px-8 text-red-400 text-sm">Error: {error}</div>
        )}

        {/* No job: show upload zone prominently */}
        {!jobId && (
          <div className="flex-1 flex items-center justify-center px-4 md:px-8">
            <div className="w-full max-w-lg">
              <UploadZone onJobId={handleJobId} disabled={isProcessing} />
            </div>
          </div>
        )}

        {/* Track list */}
        {tracks.length > 0 && (
          <div className="flex-1 overflow-y-auto px-2 md:px-4">
            <TrackList tracks={tracks} newTrackIndices={newIndicesRef.current} />
          </div>
        )}
      </main>
    </div>
  );
}
