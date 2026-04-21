import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { createServerClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { Track } from '@/types';

export default async function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const service = createServiceClient();
  const { data: job } = await service
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!job) notFound();

  const tracks = (job.result_json as Track[]) ?? [];
  const recognized = tracks.filter((t) => t.recognized);

  return (
    <PageShell>
      <div className="max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/history" className="text-[#6B6B6B] hover:text-white text-xs transition-colors">
            ← History
          </Link>
        </div>

        <h1 className="text-2xl font-black text-white mb-1 truncate">{job.file_name}</h1>
        <p className="text-[#6B6B6B] text-xs mb-6">
          {new Date(job.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          {' · '}
          {job.track_count} track{job.track_count !== 1 ? 's' : ''} identified
        </p>

        {job.zip_path && (
          <Link
            href={`/api/history-download/${job.id}`}
            className="inline-flex items-center gap-2 bg-spotify-green hover:bg-[#FB923C] text-black font-bold px-5 py-2.5 rounded-full transition-colors text-sm mb-8"
          >
            ↓ Download ZIP
          </Link>
        )}

        <div className="space-y-2">
          {recognized.map((track) => (
            <div key={track.index} className="flex items-center gap-3 border border-[#282828] rounded-xl p-3">
              {track.coverUrl ? (
                <Image
                  src={track.coverUrl}
                  alt={track.album}
                  width={40}
                  height={40}
                  className="rounded flex-shrink-0 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-[#282828] flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-semibold truncate">{track.title}</p>
                <p className="text-[#6B6B6B] text-xs truncate">{track.artist}</p>
              </div>
              <a
                href={`https://www.discogs.com/search/?q=${encodeURIComponent(`${track.title} ${track.artist}`)}&type=release`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#FB923C] hover:bg-[#EA580C] transition-colors ml-2"
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
