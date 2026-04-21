import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { createServerClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export default async function HistoryPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const service = createServiceClient();
  const { data: jobs } = await service
    .from('jobs')
    .select('id, file_name, track_count, created_at, zip_path')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <PageShell>
      <div className="max-w-lg">
        <h1 className="text-2xl font-black text-white mb-2">Your History</h1>
        <p className="text-[#B3B3B3] text-sm mb-8">Past mix identifications.</p>

        {!jobs || jobs.length === 0 ? (
          <div className="border border-[#282828] rounded-xl p-8 text-center">
            <p className="text-[#6B6B6B] text-sm">No mixes identified yet.</p>
            <p className="text-[#535353] text-xs mt-1">Upload a mix on the home page to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="border border-[#282828] rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{job.file_name}</p>
                  <p className="text-[#6B6B6B] text-xs mt-0.5">
                    {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' · '}
                    {job.track_count} track{job.track_count !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/history/${job.id}`}
                    className="text-spotify-green text-xs hover:underline"
                  >
                    View
                  </Link>
                  {job.zip_path && (
                    <Link
                      href={`/api/history-download/${job.id}`}
                      className="bg-[#282828] hover:bg-[#3E3E3E] text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                    >
                      ↓ ZIP
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
