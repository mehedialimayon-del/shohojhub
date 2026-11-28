import Link from 'next/link';
import ConnectRealtime from '@/components/ConnectRealtime';
import PushPreference from '@/components/PushPreference';
import { formatDhakaTime, pageOffset, requireConnectAccount } from '@/lib/connect';
import { publicPushKey } from '@/lib/push';

export default async function Notifications({ searchParams }: { searchParams: Promise<{ offset?: string }> }) {
  const { client, userId } = await requireConnectAccount('/notifications');
  const offset = pageOffset((await searchParams).offset);
  const [module, result] = await Promise.all([
    client.from('system_modules').select('enabled').eq('module_key','notifications').maybeSingle(),
    client.from('notifications').select('id,read_at,created_at,messages(sender_id,body)')
      .eq('user_id', userId).order('created_at', { ascending: false }).order('id', { ascending: false }).range(offset,offset + 20),
  ]);
  const notices = result.data ?? [];
  return <main className="hub-width page-content">
    <h1 className="mb-4 text-2xl font-bold">নোটিফিকেশন</h1>
    <Link href="/connect" className="back-link">Shohoj Connect</Link>
    {!module.data?.enabled || result.error ? <p role="status">নোটিফিকেশন এখন পাওয়া যাচ্ছে না।</p> : <>
      <ConnectRealtime url={process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''} anonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''} userId={userId} />
      <PushPreference keyValue={publicPushKey()} />
      {notices.length ? <ul className="grid gap-2">
        {notices.slice(0,20).map(notice => {
          const match = Array.isArray(notice.messages) ? notice.messages[0] : notice.messages;
          return <li className="hub-card" key={notice.id}>
            <Link className="block" href={match ? '/connect/' + match.sender_id : '/connect'}>
              <strong>{notice.read_at ? 'পড়া হয়েছে' : 'নতুন বার্তা'}</strong>
              {match && <p className="truncate">{match.body}</p>}
              <time dateTime={notice.created_at} className="text-sm text-neutral-300">{formatDhakaTime.format(new Date(notice.created_at))}</time>
            </Link>
          </li>;
        })}
      </ul> : <p>এখনো কোনো নোটিফিকেশন নেই।</p>}
      <div className="mt-4 flex gap-2">
        {offset > 0 && <Link className="hub-button hub-button-outline" href={'/notifications?offset=' + Math.max(0,offset - 20)}>আগের পাতা</Link>}
        {notices.length > 20 && offset < 500 && <Link className="hub-button hub-button-outline" href={'/notifications?offset=' + (offset + 20)}>পরের পাতা</Link>}
      </div>
    </>}
  </main>;
}
