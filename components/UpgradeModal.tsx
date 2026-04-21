'use client';

import Link from 'next/link';

interface Props {
  onClose: () => void;
}

export function UpgradeModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="bg-[#282828] rounded-2xl p-8 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-white text-xl font-black mb-2">Monthly limit reached</h2>
        <p className="text-[#B3B3B3] text-sm mb-4 leading-relaxed">
          You&apos;ve used all <strong className="text-white">3 free identifications</strong> this month.
          Upgrade to Premium for unlimited access.
        </p>

        <ul className="space-y-1.5 mb-6">
          {['Unlimited mix identifications', 'Permanent history & re-downloads', 'Priority processing'].map((f) => (
            <li key={f} className="flex items-center gap-2 text-[#B3B3B3] text-xs">
              <span className="text-spotify-green">✓</span> {f}
            </li>
          ))}
        </ul>

        <div className="space-y-3">
          <Link
            href="/account"
            className="block w-full bg-spotify-green hover:bg-[#FB923C] text-black font-bold py-3 rounded-full text-center transition-colors text-sm"
          >
            Upgrade to Premium
          </Link>
        </div>

        <p className="text-[#535353] text-xs text-center mt-4">
          Your limit resets on the 1st of next month.
        </p>

        <button
          onClick={onClose}
          className="mt-3 w-full text-[#6B6B6B] hover:text-white text-xs transition-colors"
        >
          Maybe next month
        </button>
      </div>
    </div>
  );
}
