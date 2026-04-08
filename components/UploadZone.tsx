'use client';

import { useState, useRef, useCallback } from 'react';

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
  const inputRef = useRef<HTMLInputElement>(null);

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
    setUploading(true);
    setUploadError(null);

    try {
      const form = new FormData();
      form.append('file', selectedFile);

      const res = await fetch('/api/upload', { method: 'POST', body: form });

      if (res.status === 413) {
        throw new Error('File is too large. Please upload a file under 500 MB.');
      }

      let data: { jobId?: string; error?: string };
      try {
        data = await res.json();
      } catch {
        throw new Error('File is too large or the server rejected the upload. Please try a file under 500 MB.');
      }

      if (!res.ok) throw new Error(data.error ?? `Upload failed (${res.status})`);
      onJobId(data.jobId!, selectedFile.name);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  if (compact) {
    return (
      <div>
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
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={[
          'border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors select-none',
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
    </div>
  );
}
