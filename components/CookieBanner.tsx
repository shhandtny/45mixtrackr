'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookie-consent');
    if (!accepted) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] border-t border-[#282828] px-4 py-4 md:px-8">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-[#B3B3B3] text-sm flex-1">
          We use cookies to improve your experience and to serve personalized ads via Google AdSense.
          By continuing to use this site, you agree to our{' '}
          <Link href="/privacy" className="text-orange-400 underline hover:text-orange-300">
            Privacy Policy
          </Link>.
        </p>
        <button
          onClick={accept}
          className="flex-shrink-0 bg-orange-500 hover:bg-orange-400 text-black font-semibold text-sm py-2 px-6 rounded-full transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
