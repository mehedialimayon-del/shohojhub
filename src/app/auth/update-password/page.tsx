import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function activeClient() {
  const client = await createClient().catch(() => null);
  if (!client) redirect('/account?status=unavailable');
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user || user.is_anonymous) redirect('/account?status=invalid_link');
  const { data: profile } = await client.from('profiles').select('suspended_at').eq('id', user.id).maybeSingle();
  if (!profile || profile.suspended_at) redirect('/account');
  return client;
}

async function updatePassword(form: FormData) {
  'use server';
  const password = String(form.get('password') ?? '');
  if (password.length < 12 || Buffer.byteLength(password) > 72) redirect('/auth/update-password?invalid=1');
  const client = await activeClient();
  const { error } = await client.auth.updateUser({ password });
  if (error) redirect('/auth/update-password?invalid=1');
  const logout = await client.auth.signOut({ scope: 'global' });
  redirect(logout.error ? '/account' : '/account?status=password_saved');
}

export default async function PasswordPage({ searchParams }: { searchParams: Promise<{ invalid?: string }> }) {
  await activeClient();
  const { invalid } = await searchParams;
  return (
    <main className="hub-width py-10">
      <Link href="/account" className="hub-button hub-button-outline">অ্যাকাউন্টে ফিরুন</Link>
      <h1 className="my-6 text-3xl font-bold">নতুন পাসওয়ার্ড</h1>
      {invalid && <p className="mb-4" role="status">পাসওয়ার্ড সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।</p>}
      <form action={updatePassword} className="hub-card grid gap-4">
        <label htmlFor="password">নতুন পাসওয়ার্ড (অন্তত ১২ অক্ষর)</label>
        <input className="hub-input" type="password" id="password" name="password" required minLength={12} maxLength={72} autoComplete="new-password" />
        <button className="hub-button" type="submit">পাসওয়ার্ড সংরক্ষণ করুন</button>
      </form>
    </main>
  );
}
