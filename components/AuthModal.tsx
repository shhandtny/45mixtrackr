'use client';

import Link from 'next/link';

interface Props {
  onClose: () => void;
}

export function AuthModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="bg-[#282828] rounded-2xl p-8 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-white text-xl font-black mb-2">Create a free account</h2>
        <p className="text-[#B3B3B3] text-sm mb-1 leading-relaxed">
          Get <strong className="text-white">3 free mix identifications per month</strong> — full tracklist, album covers, and SRT subtitle file.
        </p>
        <p className="text-[#B3B3B3] text-xs mb-6">No credit card required.</p>

        <div className="space-y-3">
          <Link
            href="/signup"
            className="block w-full bg-spotify-green hover:bg-[#FB923C] text-black font-bold py-3 rounded-full text-center transition-colors text-sm"
          >
            Sign up free
          </Link>
          <Link
            href="/login"
            className="block w-full border border-[#535353] hover:border-[#B3B3B3] text-white font-semibold py-3 rounded-full text-center transition-colors text-sm"
          >
            Sign in
          </Link>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full text-[#6B6B6B] hover:text-white text-xs transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
