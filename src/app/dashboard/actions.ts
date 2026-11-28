'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function savePreferences(form: FormData) {
  const client = await createClient().catch(() => null);
  if (!client) redirect('/dashboard?status=unavailable');
  const { data: { user } } = await client.auth.getUser();
  if (!user || user.is_anonymous) redirect('/account?returnTo=/dashboard');

  const choice = String(form.get('role') ?? '');
  const district = String(form.get('district') ?? '') || null;
  const consent = form.get('consent') === 'on';
  if (district && !consent) redirect('/dashboard?status=consent');
  const { data, error } = await client.rpc('save_member_preferences', { choice, district, consent });
  redirect('/dashboard?status=' + (error || !data ? 'unavailable' : 'saved'));
}
