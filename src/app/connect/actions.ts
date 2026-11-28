'use server';

import { after } from 'next/server';
import { redirect } from 'next/navigation';
import { postIdPattern } from '@/lib/feed';
import { requireConnectAccount } from '@/lib/connect';
import { deliverMessagePush } from '@/lib/push';

function id(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === 'string' && postIdPattern.test(value) ? value : null;
}

export async function sendChat(form: FormData) {
  const { client } = await requireConnectAccount('/connect');
  const peer = id(form, 'peer');
  const post = id(form, 'post');
  const requestId = id(form, 'request');
  const body = String(form.get('body') ?? '').trim();
  const path = peer ? '/connect/' + peer : '/connect';
  if (!peer || !requestId || !body || body.length > 2000) redirect(path + '?status=invalid');
  if (post) {
    const { data } = await client.rpc('post_message_peer', { target_post: post });
    if (data !== peer) redirect(path + '?status=unavailable');
  }
  const { data, error } = await client.rpc('send_message', {
    other_user: peer, message_body: body, idempotency_key: requestId,
  });
  if (error || !data) redirect(path + '?status=unavailable' + (post ? '&post=' + post : ''));
  after(() => deliverMessagePush(peer, data));
  redirect(path);
}

export async function changeBlock(form: FormData) {
  const { client } = await requireConnectAccount('/connect');
  const peer = id(form, 'peer');
  if (!peer) redirect('/connect');
  const { error } = await client.rpc('set_message_block', { other_user: peer, blocked: form.get('blocked') === 'true' });
  redirect('/connect/' + peer + '?status=' + (error ? 'unavailable' : 'updated'));
}

export async function reportMessage(form: FormData) {
  const { client } = await requireConnectAccount('/connect');
  const peer = id(form, 'peer');
  const message = id(form, 'message');
  const reason = String(form.get('reason') ?? '').trim();
  if (!peer) redirect('/connect');
  const path = '/connect/' + peer;
  if (!message || reason.length < 8 || reason.length > 300) redirect(path + '?status=invalid');
  const { error } = await client.from('message_reports').insert({ message_id: message, reason });
  redirect(path + '?status=' + (!error || error.code === '23505' ? 'reported' : 'unavailable'));
}

export async function markConversationRead(peer: string) {
  if (!postIdPattern.test(peer)) return;
  const { client } = await requireConnectAccount('/connect');
  await client.rpc('read_conversation', { peer });
}
