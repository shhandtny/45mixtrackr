'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  plan: string;
  email: string;
  stripe_customer_id: string | null;
}

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [managing, setManaging] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const upgraded = searchParams.get('upgraded') === '1';

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return; }

      const { data: p } = await supabase
        .from('profiles')
        .select('plan, email, stripe_customer_id')
        .eq('id', data.user.id)
        .single();

      const month = new Date().toISOString().slice(0, 7);
      const { data: u } = await supabase
        .from('usage')
        .select('count')
        .eq('user_id', data.user.id)
        .eq('month', month)
        .single();

      setProfile(p);
      setUsageCount(u?.count ?? 0);
      setLoading(false);
    });
  }, [router]);

  async function handleUpgrade() {
    setUpgrading(true);
    const res = await fetch('/api/stripe/checkout', { method: 'POST' });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setUpgrading(false);
  }

  async function handleManage() {
    setManaging(true);
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setManaging(false);
  }

  if (loading) {
    return (
      <PageShell>
        <div className="max-w-lg">
          <p className="text-[#6B6B6B] text-sm">Loading…</p>
        </div>
      </PageShell>
    );
  }

  const isPremium = profile?.plan === 'premium';
  const FREE_LIMIT = 3;

  return (
    <PageShell>
      <div className="max-w-lg">
        <h1 className="text-2xl font-black text-white mb-1">Account</h1>
        <p className="text-[#6B6B6B] text-xs mb-8">{profile?.email}</p>

        {upgraded && (
          <div className="border border-spotify-green/40 bg-spotify-green/10 rounded-xl p-4 mb-6">
            <p className="text-spotify-green text-sm font-semibold">Welcome to Premium! Unlimited identifications are now active.</p>
          </div>
        )}

        {/* Plan card */}
        <div className="border border-[#282828] rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-bold">{isPremium ? 'Premium' : 'Free'}</p>
              <p className="text-[#6B6B6B] text-xs mt-0.5">
                {isPremium
                  ? 'Unlimited mix identifications'
                  : `${Math.max(0, FREE_LIMIT - usageCount)} of ${FREE_LIMIT} identifications remaining this month`}
              </p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isPremium ? 'bg-spotify-green/20 text-spotify-green' : 'bg-[#282828] text-[#B3B3B3]'}`}>
              {isPremium ? 'Premium' : 'Free'}
            </span>
          </div>

          {!isPremium && (
            <div className="w-full bg-[#1a1a1a] rounded-full h-1.5 mb-4">
              <div
                className="h-1.5 rounded-full bg-spotify-green transition-all"
                style={{ width: `${Math.min(100, (usageCount / FREE_LIMIT) * 100)}%` }}
              />
            </div>
          )}

          {isPremium ? (
            <button
              onClick={handleManage}
              disabled={managing}
              className="w-full border border-[#535353] hover:border-[#B3B3B3] text-white text-sm font-semibold py-2.5 rounded-full transition-colors disabled:opacity-50"
            >
              {managing ? 'Redirecting…' : 'Manage subscription'}
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full bg-spotify-green hover:bg-[#FB923C] text-black text-sm font-bold py-2.5 rounded-full transition-colors disabled:opacity-50"
            >
              {upgrading ? 'Redirecting…' : 'Upgrade to Premium — $4.99/month'}
            </button>
          )}
        </div>

        {/* Premium features */}
        {!isPremium && (
          <div className="border border-[#282828] rounded-xl p-5">
            <p className="text-white text-sm font-semibold mb-3">What you get with Premium</p>
            <ul className="space-y-2">
              {['Unlimited mix identifications', 'Permanent history & re-downloads', 'Priority processing'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-[#B3B3B3] text-xs">
                  <span className="text-spotify-green">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PageShell>
  );
}
