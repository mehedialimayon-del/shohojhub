import Link from 'next/link';
import { formatDhakaTime, pageOffset, requireConnectAccount } from '@/lib/connect';
import ConnectRealtime from '@/components/ConnectRealtime';

type Thread = { peer_id: string; peer_name: string | null; latest_message: string; latest_at: string; unread: number };

export default async function Connect({ searchParams }: { searchParams: Promise<{ offset?: string }> }) {
  const { client, userId } = await requireConnectAccount('/connect');
  const offset = pageOffset((await searchParams).offset);
  const [enabled, inbox] = await Promise.all([
    client.from('system_modules').select('enabled').eq('module_key','messaging').maybeSingle(),
    client.rpc('connect_inbox', { page_offset: offset }),
  ]);
  const threads = (inbox.data ?? []) as Thread[];
  return <main className="hub-width page-content">
    <h1 className="mb-4 text-2xl font-bold">Shohoj Connect</h1>
    <div className="mb-4 flex flex-wrap gap-2">
      <Link className="hub-button hub-button-outline" href="/notifications">নোটিফিকেশন</Link>
      <Link className="hub-button hub-button-outline" href="/feed">লাইভ ফিড</Link>
    </div>
    {!enabled.data?.enabled || inbox.error ? <p role="status">মেসেজিং এখন পাওয়া যাচ্ছে না।</p> : <>
      <ConnectRealtime url={process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''} anonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''} userId={userId} />
      {threads.length ? <ul className="grid gap-2">{threads.slice(0,20).map(thread => <li key={thread.peer_id} className="hub-card">
        <Link className="block" href={'/connect/' + thread.peer_id}>
          <strong>{thread.peer_name || 'সহজ হাব সদস্য'}</strong>{thread.unread > 0 && <span className="ml-2 hub-accent">{thread.unread} অপঠিত</span>}
          <p className="truncate">{thread.latest_message}</p><time className="text-sm text-neutral-300" dateTime={thread.latest_at}>{formatDhakaTime.format(new Date(thread.latest_at))}</time>
        </Link>
      </li>)}</ul> : <p>এখনো কোনো কথোপকথন নেই। প্রকাশিত পোস্ট থেকে বার্তা শুরু করুন।</p>}
      <nav className="mt-4 flex gap-3" aria-label="ইনবক্সের পাতা">
        {offset > 0 && <Link className="hub-button hub-button-outline" href={'/connect?offset=' + Math.max(0,offset - 20)}>আগের পাতা</Link>}
        {threads.length > 20 && offset < 500 && <Link className="hub-button hub-button-outline" href={'/connect?offset=' + (offset + 20)}>পরের পাতা</Link>}
      </nav>
    </>}
  </main>;
}
