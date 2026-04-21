import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/billing';

export const runtime = 'nodejs';

export async function POST() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const session = await createCheckoutSession(user.id, user.email!);
  return NextResponse.json({ url: session.url });
}
