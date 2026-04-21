import { createServiceClient } from '@/lib/supabase/service';

export const FREE_LIMIT = 3;

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7); // '2026-04'
}

export async function checkAndIncrementUsage(
  userId: string
): Promise<{ allowed: boolean; count: number; limit: number }> {
  const supabase = createServiceClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single();

  if (profile?.plan === 'premium') {
    return { allowed: true, count: 0, limit: -1 };
  }

  const month = currentMonth();
  const { data: newCount, error } = await supabase.rpc('increment_usage', {
    p_user_id: userId,
    p_month: month,
  });

  if (error) throw new Error(`Usage increment failed: ${error.message}`);

  const count = newCount as number;

  if (count > FREE_LIMIT) {
    // Cap counter so repeated blocked attempts don't inflate it
    await supabase
      .from('usage')
      .update({ count: FREE_LIMIT })
      .eq('user_id', userId)
      .eq('month', month);
    return { allowed: false, count: FREE_LIMIT, limit: FREE_LIMIT };
  }

  return { allowed: true, count, limit: FREE_LIMIT };
}
