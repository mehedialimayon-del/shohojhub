import { notFound, redirect } from 'next/navigation';
import { requireConnectAccount } from '@/lib/connect';
import { postIdPattern } from '@/lib/feed';

export default async function StartPostChat({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!postIdPattern.test(id)) notFound();
  const { client } = await requireConnectAccount('/connect');
  const { data: peer } = await client.rpc('post_message_peer', { target_post: id });
  if (!peer) notFound();
  redirect('/connect/' + peer + '?post=' + id);
}
