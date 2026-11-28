import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { postIntents } from '@/lib/feed';
import PostForm from '@/components/posts/PostForm';
import PostNotice from '@/components/posts/PostNotice';

export const dynamic = 'force-dynamic';

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ status?: string; intent?: string }> }) {
  const { status, intent } = await searchParams;
  const selected = intent && Object.hasOwn(postIntents, intent) ? intent : 'general';
  const client = await createClient().catch(() => null);
  const auth = client ? await client.auth.getUser() : null;
  const user = auth?.data.user;
  const returnTo = '/posts/new' + (selected === 'general' ? '' : '?intent=' + selected);
  return <main className="hub-width page-content post-compose-page">
    <Link href="/feed" className="hub-button hub-button-outline post-back">লাইভ ফিডে ফিরুন</Link>
    <div className="page-title-row"><h1>নতুন পোস্ট দিন</h1></div>
    <PostNotice status={status} />
    {!user || user.is_anonymous ? <section className="hub-card post-login-prompt">
      <strong>পোস্ট দিতে সাইন ইন প্রয়োজন</strong>
      <Link className="hub-button" href={'/account?mode=login&returnTo=' + encodeURIComponent(returnTo)}>সাইন ইন করুন</Link>
    </section> : <PostForm intent={selected} />}
  </main>;
}
