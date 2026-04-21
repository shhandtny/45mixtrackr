'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function PageShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    // getSession reads from cookie instantly (no network) — eliminates flash
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) setUser(data.session.user);
    });
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
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

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={[
        'fixed md:static z-30 top-0 left-0 h-full w-64 flex-shrink-0 flex flex-col bg-black transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ].join(' ')}>
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <span className="font-synthemesc text-[#f15a2d] text-xl leading-tight tracking-wide">45mixtrackr</span>
          </Link>
          <button className="md:hidden text-[#B3B3B3] hover:text-white p-1" onClick={() => setSidebarOpen(false)}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="mx-2 rounded-lg bg-spotify-surface flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="text-[#B3B3B3] text-sm font-bold flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 18v-2h18v2H3zm0-5v-2h18v2H3zm0-5V6h18v2H3z"/>
              </svg>
              Your Library
            </p>
          </div>
          <div className="px-4 py-2 flex-1">
            <Link
              href="/"
              className="flex items-center gap-3 p-2 rounded-md hover:bg-spotify-hover transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="w-10 h-10 rounded bg-spotify-hover flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
                </svg>
              </div>
              <p className="text-[#B3B3B3] text-xs hover:text-white transition-colors">Identify a mix</p>
            </Link>
            {/* Mobile nav links */}
            <div className="md:hidden mt-3 flex flex-col gap-1 px-2">
              {navLinks.filter(l => ['Blog', 'About', 'Contact'].includes(l.label)).map(({ href, label }) => (
                <Link key={href} href={href} className="text-sm font-bold text-white hover:text-[#B3B3B3] transition-colors uppercase tracking-wide py-1">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

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

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="relative flex items-center justify-between px-4 py-3 md:py-5 bg-spotify-surface flex-shrink-0">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="text-[#B3B3B3] hover:text-white p-1 md:hidden">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 18v-2h18v2H3zm0-5v-2h18v2H3zm0-5V6h18v2H3z"/>
              </svg>
            </button>
          </div>
          {/* Center: logo (all screens) */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/45logo.svg" alt="45 Mix Trackr" className="h-8 w-auto object-contain" />
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6 pr-6">
            {navLinks.filter(l => ['Blog', 'About', 'Contact'].includes(l.label)).map(({ href, label }) => (
              <Link key={href} href={href} className="text-sm font-bold text-white hover:text-[#B3B3B3] transition-colors uppercase tracking-wide">
                {label}
              </Link>
            ))}

            {/* Account icon with dropdown */}
            <div className="relative group">
              <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[#282828] border border-[#535353] hover:border-[#B3B3B3] hover:bg-[#3E3E3E] transition-colors">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </button>

              <div className="absolute right-0 top-full mt-2 w-44 bg-[#282828] rounded-xl shadow-2xl border border-[#3E3E3E] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 py-1">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-[#3E3E3E]">
                      <p className="text-white text-xs font-semibold truncate">{user.email}</p>
                    </div>
                    <Link href="/history" className="block px-4 py-2.5 text-sm text-[#B3B3B3] hover:text-white hover:bg-[#3E3E3E] transition-colors">
                      History
                    </Link>
                    <Link href="/account" className="block px-4 py-2.5 text-sm text-[#B3B3B3] hover:text-white hover:bg-[#3E3E3E] transition-colors">
                      Account
                    </Link>
                    <div className="border-t border-[#3E3E3E] mt-1 pt-1">
                      <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 text-sm text-[#B3B3B3] hover:text-white hover:bg-[#3E3E3E] transition-colors">
                        Sign out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-2.5 text-sm text-[#B3B3B3] hover:text-white hover:bg-[#3E3E3E] transition-colors">
                      Sign in
                    </Link>
                    <Link href="/signup" className="block px-4 py-2.5 text-sm text-spotify-green font-semibold hover:bg-[#3E3E3E] transition-colors">
                      Sign up free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>
        </div>

        <main className="flex-1 overflow-y-auto bg-spotify-black md:rounded-lg md:m-2 md:ml-0">
          {/* Top banner */}
          <div
            className="w-full h-48 md:h-64 flex-shrink-0"
            style={{
              backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, #121212 100%), url(/images/mainbanner.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="px-4 md:px-8 py-8 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
