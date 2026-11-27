'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailFrom(form: FormData) {
  return String(form.get('email') ?? '').trim().toLowerCase();
}

function callbackUrl(flow: 'account' | 'recovery') {
  const configured = process.env.SHOHOJHUB_SITE_URL;
  if (!configured && process.env.NODE_ENV === 'production') throw new Error('Missing SHOHOJHUB_SITE_URL');
  const url = new URL('/auth/callback', configured ?? 'http://localhost:3000');
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') throw new Error('HTTPS is required');
  url.searchParams.set('flow', flow);
  return url.href;
}

export async function submitAccount(form: FormData) {
  const intent = form.get('intent');
  if (intent !== 'login' && intent !== 'register' && intent !== 'recovery' && intent !== 'resend') redirect('/account?status=invalid');
  const email = emailFrom(form);
  const password = String(form.get('password') ?? '');
  const needsPassword = intent === 'login' || intent === 'register';
  if (email.length > 254 || !emailPattern.test(email) || (needsPassword && (password.length === 0 || Buffer.byteLength(password) > 72)) || (intent === 'register' && password.length < 12)) {
    redirect('/account?status=invalid');
  }

  let status = 'unavailable';
  try {
    const client = await createClient();
    if (intent === 'login') {
      const { error } = await client.auth.signInWithPassword({ email, password });
      status = error ? 'login_error' : 'signed_in';
    } else {
      const emailRedirectTo = callbackUrl(intent === 'recovery' ? 'recovery' : 'account');
      if (intent === 'register') await client.auth.signUp({ email, password, options: { emailRedirectTo } });
      if (intent === 'recovery') await client.auth.resetPasswordForEmail(email, { redirectTo: emailRedirectTo });
      if (intent === 'resend') await client.auth.resend({ email, type: 'signup', options: { emailRedirectTo } });
      status = 'email_requested';
    }
  } catch {
    status = 'unavailable';
  }
  redirect(status === 'signed_in' ? '/account' : '/account?status=' + status);
}

export async function signOut() {
  const client = await createClient();
  await client.auth.signOut({ scope: 'local' });
  redirect('/account');
}

export async function updateProfile(form: FormData) {
  const displayName = String(form.get('displayName') ?? '').trim();
  if (!displayName || displayName.length > 100) redirect('/account?status=invalid');
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user || user.is_anonymous) redirect('/account');
  const { data, error } = await client.from('profiles').update({ display_name: displayName })
    .eq('id', user.id).select('id').maybeSingle();
  redirect('/account?status=' + (error || !data ? 'profile_error' : 'saved'));
}
