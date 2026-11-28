import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { postCategories, postColumns, postIdPattern, postIntents, postStatus, type Post } from '@/lib/feed';
import PostForm from '@/components/posts/PostForm';
import PostNotice from '@/components/posts/PostNotice';
import { changePostStatus, postPhoto, reportPost } from '../actions';

export const dynamic = 'force-dynamic';

export default async function PostPage({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  if (!postIdPattern.test(id)) notFound();
  const client = await createClient().catch(() => null);
  if (!client) notFound();
  const [result, auth] = await Promise.all([
    client.from('posts').select(postColumns).eq('id', id).maybeSingle(),
    client.auth.getUser(),
  ]);
  if (!result.data || result.error) notFound();
  const post = result.data as Post;
  const user = auth.data.user;
  const owned = user && !user.is_anonymous ? await client.rpc('current_user_posts') : null;
  const mine = Boolean(owned?.data?.some((row: { id: string }) => row.id === id));
  const published = postStatus(post) === 'প্রকাশিত';
  const status = (await searchParams).status;
  return <main className="hub-width page-content post-compose-page">
    <Link href={mine ? '/posts/manage' : '/feed'} className="hub-button hub-button-outline">{mine ? 'আমার পোস্ট' : 'লাইভ ফিডে ফিরুন'}</Link>
    <PostNotice status={status} />
    <article className="hub-card grid gap-3 mt-4">
      <span className="page-kicker">{postCategories[post.category as keyof typeof postCategories]} · {postIntents[post.intent as keyof typeof postIntents]}</span>
      <h1 className="text-2xl font-bold">{post.title}</h1>
      {mine && <p>{postStatus(post)}</p>}
      {post.has_photo && <Image src={'/api/posts/' + id + '/photo'} unoptimized width={640} height={400} alt="" className="max-h-80 w-full rounded-lg object-contain" />}
      <p className="whitespace-pre-wrap break-words">{post.body}</p>
      <p>{[post.division, post.district, post.area].filter(Boolean).join(' · ')}</p>
      <p>যোগাযোগের নাম · {post.contact_name}</p>
    </article>
    {mine && <div className="mt-5 grid gap-4">
      {post.status === 'pending' && <>
        <h2 className="text-xl font-bold">পোস্ট সম্পাদনা</h2>
        <PostForm post={post} />
        <form action={postPhoto} className="hub-card grid gap-3">
          <input type="hidden" name="id" value={id} />
          <label>পোস্টের ছবি<input className="hub-input" name="photo" type="file" accept="image/jpeg,image/png,image/webp" /></label>
          <button className="hub-button" name="action" value="upload">ছবি সংরক্ষণ করুন</button>
          {post.has_photo && <button className="hub-button hub-button-outline" name="action" value="remove">ছবি সরান</button>}
        </form>
      </>}
      {post.status !== 'archived' && <form action={changePostStatus} className="flex flex-wrap gap-3">
        <input type="hidden" name="id" value={id} />
        {['published','rejected'].includes(post.status) && <button className="hub-button hub-button-outline" name="action" value="revise">রিভিউতে ফিরিয়ে সম্পাদনা করুন</button>}
        <button className="hub-button hub-button-outline" name="action" value="close">পোস্ট বন্ধ করুন</button>
      </form>}
    </div>}
    {!mine && published && (user && !user.is_anonymous ? <form action={reportPost} className="hub-card post-form mt-5">
      <input type="hidden" name="id" value={id} />
      <label>রিপোর্টের কারণ<textarea name="reason" minLength={8} maxLength={300} required rows={2} /></label>
      <button className="hub-button hub-button-outline">রিপোর্ট করুন</button>
    </form> : <Link href="/account?mode=login" className="mt-4 inline-block underline">রিপোর্ট করতে সাইন ইন করুন</Link>)}
  </main>;
}
