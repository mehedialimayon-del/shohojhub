import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { signOut, submitAccount, updateProfile } from './actions';

export const dynamic = 'force-dynamic';

const messages: Record<string, string> = {
  invalid: 'ইমেইল বা ফর্মের তথ্য ঠিক করে আবার চেষ্টা করুন।',
  login_error: 'সাইন ইন করা যায়নি। তথ্য যাচাই করে আবার চেষ্টা করুন।',
  email_requested: 'ঠিকানাটি এই অনুরোধের জন্য যোগ্য হলে একটি ইমেইল পাবেন। ইনবক্স ও স্প্যাম ফোল্ডার দেখুন।',
  unavailable: 'অ্যাকাউন্ট সেবা এখন পাওয়া যাচ্ছে না।',
  invalid_link: 'ইমেইল লিংকটি ব্যবহার করা যায়নি। নতুন লিংক চেয়ে আবার চেষ্টা করুন।',
  saved: 'প্রোফাইল সংরক্ষণ হয়েছে।',
  profile_error: 'প্রোফাইল সংরক্ষণ করা যায়নি।',
  password_saved: 'পাসওয়ার্ড বদলেছে। নতুন পাসওয়ার্ড দিয়ে সাইন ইন করুন।',
  post_submitted: 'আপনার পোস্ট রিভিউয়ের জন্য জমা হয়েছে। অনুমোদিত হলে লাইভ ফিডে দেখা যাবে।',
};

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ status?: string; mode?: string; returnTo?: string }> }) {
  const { status, mode, returnTo } = await searchParams;
  const notice = typeof status === 'string' && Object.hasOwn(messages, status) ? messages[status] : '';
  const client = await createClient().catch(() => null);
  const auth = client ? await client.auth.getUser() : null;
  const user = !auth?.error ? auth?.data.user : null;
  const profileResult = client && user && !user.is_anonymous
    ? await client.from('profiles').select('display_name,suspended_at').eq('id', user.id).maybeSingle()
    : null;
  const profile = profileResult?.data;
  const formMode = mode === 'register' || mode === 'resend' || mode === 'recovery' ? mode : 'login';
  const labels = { login: 'সাইন ইন', register: 'অ্যাকাউন্ট তৈরি', resend: 'যাচাই লিংক আবার পাঠান', recovery: 'পাসওয়ার্ড রিসেট লিংক পাঠান' };
  return (
    <main className="hub-width py-10">
      <Link href="/" className="hub-button hub-button-outline">সহজ হাব হোম</Link>
      <h1 className="my-6 text-3xl font-bold">অ্যাকাউন্ট</h1>
      {notice && <p className="mb-4" role="status">{notice}</p>}
      {user ? <>
        {profile && !profile.suspended_at ? (
          <form action={updateProfile} className="hub-card grid gap-4">
            <p>{user.email}</p>
            <label htmlFor="displayName">প্রোফাইলে দেখানো নাম</label>
            <input className="hub-input" id="displayName" name="displayName" defaultValue={profile.display_name} required maxLength={100} />
            <button className="hub-button" type="submit">প্রোফাইল সংরক্ষণ করুন</button>
          </form>
        ) : <p>{profile?.suspended_at ? 'এই অ্যাকাউন্ট স্থগিত আছে।' : 'প্রোফাইল এখন খোলা যাচ্ছে না।'}</p>}
        <form action={signOut} className="mt-4"><button className="hub-button hub-button-outline">সাইন আউট</button></form>
      </> : <>
        {!client && !notice && <p className="mb-4" role="status">{messages.unavailable}</p>}
        <form action={submitAccount} className="hub-card grid gap-4">
          <input type="hidden" name="intent" value={formMode} />
          <input type="hidden" name="returnTo" value={returnTo === '/posts/new' ? '/posts/new' : '/account'} />
          <label htmlFor="email">ইমেইল</label>
          <input className="hub-input" name="email" id="email" type="email" autoComplete="email" required maxLength={254} />
          {(formMode === 'register' || formMode === 'login') && <>
            <label htmlFor="password">পাসওয়ার্ড</label>
            <input className="hub-input" name="password" id="password" type="password" required
              autoComplete={formMode === 'register' ? 'new-password' : 'current-password'}
              minLength={formMode === 'register' ? 12 : undefined} maxLength={72} />
          </>}
          <button className="hub-button" type="submit" disabled={!client}>{labels[formMode]}</button>
        </form>
        <nav aria-label="অ্যাকাউন্ট সহায়তা" className="mt-4 flex max-w-xl flex-wrap gap-4 [&_a]:underline">
          {formMode !== 'login' && <Link href="/account">সাইন ইন</Link>}
          {formMode !== 'register' && <Link href="/account?mode=register">নতুন অ্যাকাউন্ট</Link>}
          {formMode !== 'recovery' && <Link href="/account?mode=recovery">পাসওয়ার্ড ভুলে গেছেন?</Link>}
          {formMode !== 'resend' && <Link href="/account?mode=resend">যাচাই ইমেইল আবার পাঠান</Link>}
        </nav>
      </>}
    </main>
  );
}
