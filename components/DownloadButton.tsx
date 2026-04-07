'use client';

interface DownloadButtonProps {
  jobId: string;
  ready: boolean;
  trackCount: number;
  inline?: boolean;
}

export function DownloadButton({ jobId, ready, trackCount, inline = false }: DownloadButtonProps) {
  if (inline) {
    return (
      <div className="flex items-center gap-4">
        {ready ? (
          <>
            {/* Green play-style download button */}
            <a
              href={`/api/download/${jobId}`}
              download
              className="w-14 h-14 bg-spotify-green hover:bg-[#FB923C] active:bg-[#169c46] rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
              title="Download ZIP"
            >
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
            </a>
            <span className="text-[#B3B3B3] text-sm">
              {trackCount} song{trackCount !== 1 ? 's' : ''} &mdash; SRT + cover images
            </span>
          </>
        ) : (
          <div className="w-14 h-14 bg-spotify-green/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-black/40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 flex flex-col items-center gap-2">
      {ready ? (
        <a
          href={`/api/download/${jobId}`}
          download
          className="bg-spotify-green hover:bg-[#FB923C] active:bg-[#169c46] text-black font-bold py-3 px-10 rounded-full transition-colors inline-block"
        >
          Download ZIP
        </a>
      ) : (
        <button disabled className="bg-spotify-green/30 text-black/40 font-bold py-3 px-10 rounded-full cursor-not-allowed">
          Download ZIP
        </button>
      )}
      {ready && (
        <p className="text-[#B3B3B3] text-xs">
          {trackCount} track{trackCount !== 1 ? 's' : ''} &mdash; subtitles.srt + cover images
        </p>
      )}
    </div>
  );
}
