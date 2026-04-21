'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleGoogle() {
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <PageShell>
        <div className="max-w-sm mx-auto mt-8 text-center">
          <div className="text-4xl mb-4">✉️</div>
          <h1 className="text-2xl font-black text-white mb-2">Check your email</h1>
          <p className="text-[#B3B3B3] text-sm">
            We sent a confirmation link to <strong className="text-white">{email}</strong>.
            Click it to activate your account.
          </p>
          <p className="text-[#6B6B6B] text-xs mt-4">
            Already confirmed?{' '}
            <Link href="/login" className="text-spotify-green hover:underline">Sign in</Link>
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-sm mx-auto mt-8">
        <h1 className="text-2xl font-black text-white mb-2">Create your account</h1>
        <p className="text-[#B3B3B3] text-sm mb-8">
          3 free mix identifications per month — no credit card required
        </p>

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 rounded-full transition-colors disabled:opacity-40 mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#282828]" />
          <span className="text-[#535353] text-xs">or</span>
          <div className="flex-1 h-px bg-[#282828]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#B3B3B3] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-[#282828] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-spotify-green placeholder-[#535353]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-[#B3B3B3] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full bg-[#282828] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-spotify-green"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-spotify-green hover:bg-[#FB923C] text-black font-bold py-3 rounded-full transition-colors disabled:opacity-40 mt-2"
          >
            {loading ? 'Creating account…' : 'Sign up free'}
          </button>
        </form>

        <p className="text-[#B3B3B3] text-sm mt-6 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-spotify-green hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
