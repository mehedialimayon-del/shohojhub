import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function requireConnectAccount(returnTo: '/connect' | '/notifications') {
  const client = await createClient().catch(() => null);
  const { data } = client ? await client.auth.getUser() : { data: null };
  if (!client || !data?.user || data.user.is_anonymous) redirect('/account?returnTo=' + returnTo);
  const { data: profile } = await client.from('profiles').select('suspended_at').eq('id', data.user.id).maybeSingle();
  if (!profile || profile.suspended_at) redirect('/account');
  return { client, userId: data.user.id };
}

export const formatDhakaTime = new Intl.DateTimeFormat('bn-BD', {
  dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Dhaka',
});

export function pageOffset(value: unknown) {
  return typeof value === 'string' && /^\d{1,3}$/.test(value) ? Math.min(500, Number(value)) : 0;
}
