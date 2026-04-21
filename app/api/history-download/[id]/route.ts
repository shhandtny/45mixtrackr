import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const service = createServiceClient();
  const { data: job } = await service
    .from('jobs')
    .select('zip_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!job?.zip_path) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: signedData, error } = await service.storage
    .from('job-files')
    .createSignedUrl(job.zip_path, 60); // 60 second expiry

  if (error || !signedData?.signedUrl) {
    return NextResponse.json({ error: 'Could not generate download link' }, { status: 500 });
  }

  return NextResponse.redirect(signedData.signedUrl);
}
