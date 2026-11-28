import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { postStatus, type Post } from '@/lib/feed';
import PostNotice from '@/components/posts/PostNotice';
import { changePostStatus, resolvePostReport } from '../actions';

export const dynamic = 'force-dynamic';

export default async function ReviewPostsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const client = await createClient().catch(() => null);
  if (!client) notFound();
  const { data: { user } } = await client.auth.getUser();
  if (!user || user.is_anonymous) redirect('/account?mode=login');
  const { data: profile } = await client.from('profiles').select('role,suspended_at').eq('id', user.id).maybeSingle();
  if (!profile || profile.suspended_at || !['founder','admin'].includes(profile.role)) notFound();
  const [posts, reports] = await Promise.all([
    client.from('posts').select('id,title,status,published_at,expires_at').in('status',['pending','published'])
      .order('created_at',{ ascending: false }).limit(70),
    client.from('post_reports').select('id,post_id,reason').is('resolved_at',null).order('created_at').limit(70),
  ]);
  return <main className="hub-width page-content post-compose-page">
    <h1 className="text-2xl font-bold mb-4">পোস্ট রিভিউ</h1>
    <PostNotice status={(await searchParams).status} />
    {(posts.error || reports.error) && <PostNotice status="unavailable" />}
    <div className="grid gap-3">
      {(posts.data ?? []).map((post: Pick<Post,'id'|'title'|'status'|'published_at'|'expires_at'>) =>
        <section key={post.id} className="hub-card">
          <Link href={'/posts/' + post.id} className="underline">{post.title}</Link>
          <p>{postStatus(post)}</p>
          <form action={changePostStatus} className="post-form mt-3">
            <input name="id" type="hidden" value={post.id} /><input name="review" type="hidden" value="1" />
            {post.status === 'pending' && <>
              <label>প্রকাশের সময় (বাংলাদেশ, ঐচ্ছিক)<input name="start" type="datetime-local" /></label>
              <label>মেয়াদ শেষ (বাংলাদেশ, ঐচ্ছিক)<input name="end" type="datetime-local" /></label>
              <button name="action" value="publish" className="hub-button">অনুমোদন করুন</button>
              <button name="action" value="reject" className="hub-button hub-button-outline">ফিরিয়ে দিন</button>
            </>}
            {post.status === 'published' && <button name="action" value="close" className="hub-button hub-button-outline">প্রকাশ বন্ধ করুন</button>}
          </form>
        </section>)}
    </div>
    <h2 className="text-xl font-bold my-4">রিপোর্ট</h2>
    {reports.data?.length ? <div className="grid gap-3">{reports.data.map(report => <article className="hub-card" key={report.id}>
      <Link href={'/posts/' + report.post_id} className="underline">পোস্ট দেখুন</Link>
      <p className="my-2 break-words">{report.reason}</p>
      <form action={resolvePostReport}><input name="id" type="hidden" value={report.id} /><button className="hub-button">রিপোর্ট পর্যালোচনা সম্পন্ন</button></form>
    </article>)}</div> : !reports.error && <p>পর্যালোচনার জন্য কোনো রিপোর্ট নেই।</p>}
  </main>;
}
