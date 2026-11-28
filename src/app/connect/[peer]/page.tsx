import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDhakaTime, pageOffset, requireConnectAccount } from '@/lib/connect';
import { postIdPattern } from '@/lib/feed';
import ConnectRealtime from '@/components/ConnectRealtime';
import { changeBlock, reportMessage, sendChat } from '../actions';

const statuses: Record<string,string> = {
  unavailable: 'বার্তা বা অনুরোধটি সম্পন্ন হয়নি।',
  invalid: 'ফর্মের তথ্য যাচাই করুন।',
  updated: 'ব্লক সেটিংস আপডেট হয়েছে।',
  reported: 'রিপোর্ট জমা হয়েছে।',
};

export default async function Conversation({ params, searchParams }: {
  params: Promise<{ peer: string }>; searchParams: Promise<{ post?: string; offset?: string; status?: string }>;
}) {
  const { peer } = await params;
  if (!postIdPattern.test(peer)) notFound();
  const { client, userId } = await requireConnectAccount('/connect');
  if (peer === userId) notFound();
  const { post, offset: offsetText, status } = await searchParams;
  const offset = pageOffset(offsetText);
  const [messages, block, context] = await Promise.all([
    client.from('messages').select('id,sender_id,recipient_id,body,created_at,read_at')
      .or('and(sender_id.eq.' + userId + ',recipient_id.eq.' + peer + '),and(sender_id.eq.' + peer + ',recipient_id.eq.' + userId + ')')
      .order('created_at', { ascending: false }).order('id', { ascending: false }).range(offset,offset + 50),
    client.from('user_blocks').select('blocked_user_id').eq('blocked_user_id', peer).maybeSingle(),
    post && postIdPattern.test(post) ? client.rpc('post_message_peer', { target_post: post }) : Promise.resolve({ data: null }),
  ]);
  if (!messages.data?.length && context.data !== peer && !block.data) notFound();
  const unread = !offset && messages.data?.some(row => row.sender_id === peer && !row.read_at);
  const next = (messages.data?.length ?? 0) > 50 && offset < 500;
  const items = (messages.data ?? []).slice(0,50).reverse();

  return <main className="hub-width page-content">
    <Link href="/connect" className="back-link">ইনবক্সে ফিরুন</Link>
    <h1 className="mb-3 text-2xl font-bold">কথোপকথন</h1>
    {status && Object.hasOwn(statuses,status) && <p role="status" className="post-notice">{statuses[status]}</p>}
    <ConnectRealtime url={process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''} anonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''} userId={userId} peer={peer} shouldMarkRead={unread} />
    {post && context.data === peer && <Link href={'/posts/' + post} className="back-link">মূল পোস্ট দেখুন</Link>}
    <ol className="connect-messages" aria-label="বার্তার ইতিহাস">
      {items.map(item => <li key={item.id} className={'hub-card connect-bubble' + (item.sender_id === userId ? ' connect-bubble-mine' : '')}>
        <p className="whitespace-pre-wrap break-words">{item.body}</p>
        <small>{formatDhakaTime.format(new Date(item.created_at))}{item.sender_id === userId ? item.read_at ? ' · পড়া হয়েছে' : ' · পাঠানো হয়েছে' : ''}</small>
        {item.sender_id !== userId && <details className="mt-1">
          <summary className="cursor-pointer text-sm">রিপোর্ট করুন</summary>
          <form className="post-form mt-2" action={reportMessage}>
            <input type="hidden" name="peer" value={peer} /><input type="hidden" name="message" value={item.id} />
            <label>রিপোর্টের কারণ<textarea name="reason" minLength={8} maxLength={300} rows={2} required /></label>
            <button type="submit" className="hub-button hub-button-outline">রিপোর্ট জমা দিন</button>
          </form>
        </details>}
      </li>)}
    </ol>
    <div className="my-3 flex gap-2">
      {offset > 0 && <Link className="hub-button hub-button-outline" href={'/connect/' + peer + '?offset=' + Math.max(0,offset - 50)}>সাম্প্রতিক বার্তা</Link>}
      {next && <Link className="hub-button hub-button-outline" href={'/connect/' + peer + '?offset=' + (offset + 50)}>পুরোনো বার্তা</Link>}
    </div>
    {!block.data && !offset && <form className="hub-card post-form mt-3" action={sendChat}>
      <input name="peer" type="hidden" value={peer} /><input name="request" type="hidden" value={randomUUID()} />
      {context.data === peer && <input name="post" type="hidden" value={post} />}
      <label>বার্তা লিখুন<textarea name="body" rows={3} maxLength={2000} required /></label>
      <button type="submit" className="hub-button">বার্তা পাঠান</button>
    </form>}
    <form className="mt-3" action={changeBlock}>
      <input type="hidden" name="peer" value={peer} />
      <button className="hub-button hub-button-outline" name="blocked" value={block.data ? 'false' : 'true'}>{block.data ? 'ব্লক খুলুন' : 'ব্যবহারকারীকে ব্লক করুন'}</button>
    </form>
  </main>;
}
