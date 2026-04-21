'use client';

import Link from 'next/link';

interface Props {
  count: number;
  limit: number;
}

export function UsageBanner({ count, limit }: Props) {
  const remaining = Math.max(0, limit - count);
  const pct = Math.min(100, (count / limit) * 100);
  const atLimit = remaining === 0;

  return (
    <div className="border border-[#282828] rounded-xl p-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-white text-xs font-semibold">
          {atLimit
            ? 'Monthly limit reached'
            : `${remaining} of ${limit} free identification${remaining !== 1 ? 's' : ''} remaining this month`}
        </p>
        <Link href="/account" className="text-spotify-green text-xs hover:underline flex-shrink-0 ml-2">
          Upgrade →
        </Link>
      </div>
      <div className="w-full bg-[#1a1a1a] rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${atLimit ? 'bg-red-500' : 'bg-spotify-green'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {atLimit && (
        <p className="text-[#535353] text-xs mt-2">Resets on the 1st of next month.</p>
      )}
    </div>
  );
}
