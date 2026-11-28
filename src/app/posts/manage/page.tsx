import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { postStatus, type Post } from '@/lib/feed';
import PostNotice from '@/components/posts/PostNotice';

export const dynamic = 'force-dynamic';

type Listing = Pick<Post, 'id' | 'title' | 'status' | 'published_at' | 'expires_at'>;

export default async function ManagePostsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const client = await createClient().catch(() => null);
  if (!client) redirect('/account?status=unavailable');
  const { data: { user } } = await client.auth.getUser();
  if (!user || user.is_anonymous) redirect('/account?mode=login');
  const [posts, profile] = await Promise.all([
    client.rpc('current_user_posts'),
    client.from('profiles').select('role,suspended_at').eq('id', user.id).maybeSingle(),
  ]);
  const rows = (posts.data ?? []) as Listing[];
  return <main className="hub-width page-content post-compose-page">
    <h1 className="text-2xl font-bold mb-4">আমার পোস্ট</h1>
    <div className="flex flex-wrap gap-2 mb-4">
      <Link href="/posts/new" className="hub-button">নতুন পোস্ট দিন</Link>
      {profile.data && !profile.data.suspended_at && ['admin','founder'].includes(profile.data.role)
        && <Link href="/posts/review" className="hub-button hub-button-outline">পোস্ট রিভিউ</Link>}
    </div>
    <PostNotice status={(await searchParams).status} />
    {posts.error ? <PostNotice status="unavailable" /> : rows.length ? <ul className="grid gap-2">
      {rows.map(post => <li key={post.id} className="hub-card"><Link href={'/posts/' + post.id} className="block underline">{post.title}</Link><p>{postStatus(post)}</p></li>)}
    </ul> : <p>আপনার কোনো পোস্ট নেই।</p>}
  </main>;
}
