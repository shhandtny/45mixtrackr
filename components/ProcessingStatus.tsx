'use client';
// Design Ref: §6 UI — Progress bar + step label during recognition

interface ProcessingStatusProps {
  step: string;
  processed: number;
  total: number;
}

export function ProcessingStatus({ step, processed, total }: ProcessingStatusProps) {
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  const showBar = total > 0;

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <p className="text-[#B3B3B3] text-sm mb-2">{step || 'Processing…'}</p>
      {showBar && (
        <div className="w-full bg-spotify-hover rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-spotify-green h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {!showBar && (
        <div className="w-full bg-spotify-hover rounded-full h-1.5 overflow-hidden">
          <div className="bg-spotify-green h-1.5 rounded-full w-1/3 animate-[slide_1.5s_ease-in-out_infinite]" />
        </div>
      )}
    </div>
  );
}
