import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createServerClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { checkAndIncrementUsage } from '@/lib/usage';

export const runtime = 'nodejs';

const ALLOWED_EXTENSIONS = new Set(['.mp3', '.mp4', '.wav', '.m4a', '.aac']);

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const usage = await checkAndIncrementUsage(user.id);
  if (!usage.allowed) {
    return NextResponse.json({ error: 'limit_reached', count: usage.count, limit: usage.limit }, { status: 403 });
  }

  const { fileName } = await request.json();
  const ext = path.extname(fileName ?? '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: `Unsupported file type: ${ext}` }, { status: 415 });
  }

  const jobId = uuidv4();
  const storageKey = `${user.id}/${jobId}/input${ext}`;

  const service = createServiceClient();
  const { data, error } = await service.storage
    .from('job-files')
    .createSignedUploadUrl(storageKey);

  if (error || !data) {
    return NextResponse.json({ error: 'Could not create upload URL' }, { status: 500 });
  }

  return NextResponse.json({ jobId, uploadUrl: data.signedUrl, storageKey, token: data.token });
}
