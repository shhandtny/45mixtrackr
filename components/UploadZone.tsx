'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FREE_LIMIT } from '@/lib/usage';
import { AuthModal } from '@/components/AuthModal';
import { UpgradeModal } from '@/components/UpgradeModal';
import { UsageBanner } from '@/components/UsageBanner';

interface UploadZoneProps {
  onJobId: (jobId: string, fileName: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

const ACCEPTED = '.mp3,.mp4,.wav,.m4a,.aac';

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadZone({ onJobId, disabled = false, compact = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      const { data: profile } = await supabase.from('profiles').select('plan').eq('id', data.user.id).single();
      if (profile?.plan) setUserPlan(profile.plan);
      const month = new Date().toISOString().slice(0, 7);
      const { data: usage } = await supabase.from('usage').select('count').eq('user_id', data.user.id).eq('month', month).single();
      if (usage) setUsageCount(usage.count);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleFile = useCallback((file: File) => {
    setSelectedFile(file);
    setUploadError(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  const handleUpload = async () => {
    if (!selectedFile) return;

    if (!userId) {
      setShowAuthModal(true);
      return;
    }

    if (userPlan !== 'premium' && usageCount >= FREE_LIMIT) {
      setShowUpgradeModal(true);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Step 1: Get a signed upload URL from our API
      const urlRes = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: selectedFile.name }),
      });

      if (urlRes.status === 401) { setShowAuthModal(true); setUploading(false); return; }
      if (urlRes.status === 403) { setShowUpgradeModal(true); setUploading(false); return; }
      if (!urlRes.ok) {
        const d = await urlRes.json().catch(() => ({}));
        throw new Error(d.error ?? 'Could not start upload');
      }

      const { jobId, storageKey, token } = await urlRes.json();

      // Step 2: Upload file directly to Supabase Storage via signed URL
      const supabase = createClient();
      const { error: storageError } = await supabase.storage
        .from('job-files')
        .uploadToSignedUrl(storageKey, token, selectedFile, {
          contentType: selectedFile.type || 'application/octet-stream',
        });
      if (storageError) throw new Error('File upload failed: ' + storageError.message);

      // Step 3: Tell our API to start processing
      const processRes = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, storageKey, fileName: selectedFile.name }),
      });
      if (!processRes.ok) throw new Error('Failed to start processing');

      setUsageCount((c) => c + 1);
      onJobId(jobId, selectedFile.name);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  const atLimit = userPlan !== 'premium' && usageCount >= FREE_LIMIT;

  if (compact) {
    return (
      <div>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
        <div
          role="button"
          tabIndex={0}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={[
            'border border-dashed rounded-lg px-3 py-3 text-center cursor-pointer transition-colors text-xs',
            isDragging ? 'border-spotify-green bg-spotify-green/10' : 'border-[#535353] hover:border-[#B3B3B3]',
            disabled ? 'opacity-40 cursor-not-allowed' : '',
          ].join(' ')}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {selectedFile ? (
            <p className="text-white truncate">{selectedFile.name}</p>
          ) : (
            <p className="text-[#B3B3B3]">Drop file or click to browse</p>
          )}
        </div>

        {selectedFile && !uploading && (
          <button
            onClick={handleUpload}
            disabled={disabled}
            className="mt-2 w-full bg-spotify-green hover:bg-[#FB923C] text-black text-xs font-bold py-2 rounded-full transition-colors disabled:opacity-40"
          >
            Identify Songs
          </button>
        )}

        {uploading && (
          <div className="mt-2 text-center">
            <p className="text-white text-xs font-semibold animate-pulse">Uploading file…</p>
            <p className="text-[#B3B3B3] text-xs mt-0.5">Large files may take a moment. Please wait.</p>
          </div>
        )}

        {uploadError && (
          <p className="mt-1 text-red-400 text-xs text-center">{uploadError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}

      {userId && userPlan !== 'premium' && (
        <UsageBanner count={usageCount} limit={FREE_LIMIT} />
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={[
          'border-2 border-dashed rounded-xl p-16 mt-4 text-center cursor-pointer transition-colors select-none',
          isDragging
            ? 'border-spotify-green bg-spotify-green/10'
            : 'border-spotify-dim hover:border-[#B3B3B3]',
          disabled ? 'opacity-40 cursor-not-allowed' : '',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <svg className="w-12 h-12 text-spotify-green mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
        </svg>

        {selectedFile ? (
          <div>
            <p className="text-white font-medium truncate">{selectedFile.name}</p>
            <p className="text-[#B3B3B3] text-sm mt-1">{formatBytes(selectedFile.size)}</p>
          </div>
        ) : (
          <div>
            <p className="text-white text-lg font-bold">Drop your mix here</p>
            <p className="text-[#B3B3B3] text-sm mt-1">
              or click to browse &mdash; MP3, MP4, WAV, M4A up to 500 MB
            </p>
          </div>
        )}
      </div>

      {selectedFile && !uploading && (
        <button
          onClick={handleUpload}
          disabled={disabled}
          className="mt-4 w-full bg-spotify-green hover:bg-[#FB923C] active:bg-[#EA580C] text-black font-bold py-3 rounded-full transition-colors disabled:opacity-40"
        >
          Identify Songs
        </button>
      )}

      {uploading && (
        <div className="mt-4 text-center space-y-1">
          <p className="text-white font-semibold animate-pulse">Uploading file…</p>
          <p className="text-[#B3B3B3] text-sm">Large files may take a few minutes. Please keep this tab open and wait.</p>
        </div>
      )}

      {uploadError && (
        <p className="mt-3 text-red-400 text-sm text-center">{uploadError}</p>
      )}

      {/* SRT explanation */}
      <div className="mt-6 border border-[#282828] rounded-xl p-4 space-y-3">
        <p className="text-white text-sm font-semibold">What you&apos;ll get</p>
        <div className="flex items-start gap-3">
          <span className="text-spotify-green text-lg leading-none mt-0.5">♪</span>
          <div>
            <p className="text-[#B3B3B3] text-xs leading-relaxed">
              <strong className="text-white">Full tracklist</strong> — every identified song with title, artist, and album cover
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-spotify-green text-lg leading-none mt-0.5">◉</span>
          <div>
            <p className="text-[#B3B3B3] text-xs leading-relaxed">
              <strong className="text-white">SRT subtitle file</strong> — import directly into <strong className="text-white">DaVinci Resolve</strong>, <strong className="text-white">Premiere Pro</strong>, <strong className="text-white">Final Cut Pro</strong>, or any video editor that supports subtitles. Song names appear as on-screen text, timed to when each track plays.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-spotify-green text-lg leading-none mt-0.5">▤</span>
          <div>
            <p className="text-[#B3B3B3] text-xs leading-relaxed">
              <strong className="text-white">Album covers ZIP</strong> — all artwork bundled and ready to use in thumbnails or social posts
            </p>
          </div>
        </div>
      </div>

      {/* Example video */}
      <div className="mt-6">
        <p className="text-white text-sm font-semibold mb-3">See it in action</p>
        <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src="https://www.youtube.com/embed/Ec8SJeQ7VTw"
            title="45mixtrackr example mix"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8">
        <p className="text-white text-sm font-semibold mb-4">Frequently asked questions</p>
        <div className="space-y-3">
          {[
            { q: 'Is 45 Mix Trackr free?', a: 'Free accounts get 3 mix identifications per month. Create a free account to get started — no credit card required.' },
            { q: 'What file formats are supported?', a: 'MP3, MP4, WAV, M4A, and AAC files up to 500 MB.' },
            { q: 'How long does it take?', a: 'Most mixes finish in 2–5 minutes. A one-hour mix typically takes around 3 minutes.' },
            { q: 'How accurate is the recognition?', a: 'We use ACRCloud audio fingerprinting — the same technology behind Shazam — which covers over 10 million songs. It works even through DJ blends and transitions.' },
            { q: 'What is the SRT file for?', a: 'Import it into DaVinci Resolve, Premiere Pro, or Final Cut Pro to show song names as on-screen text in your mix video, perfectly timed to each track.' },
            { q: 'Does it work with vinyl mixes?', a: 'Yes. Any audio recording works, including vinyl sets.' },
          ].map(({ q, a }) => (
            <details key={q} className="border border-[#282828] rounded-xl overflow-hidden group">
              <summary className="px-4 py-3 text-white text-xs font-semibold cursor-pointer list-none flex items-center justify-between hover:bg-spotify-hover transition-colors">
                {q}
                <svg className="w-4 h-4 text-[#6B6B6B] flex-shrink-0 transition-transform group-open:rotate-180" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </summary>
              <p className="px-4 pb-3 text-[#B3B3B3] text-xs leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
