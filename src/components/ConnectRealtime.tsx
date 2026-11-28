'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { markConversationRead } from '@/app/connect/actions';

export default function ConnectRealtime({ url, anonKey, userId, peer, shouldMarkRead, notifications = false }: {
  url: string; anonKey: string; userId: string; peer?: string; shouldMarkRead?: boolean; notifications?: boolean;
}) {
  const router = useRouter();
  useEffect(() => {
    if (peer && shouldMarkRead) void markConversationRead(peer).then(() => router.refresh()).catch(() => {});
  }, [peer, shouldMarkRead, router]);
  useEffect(() => {
    if (!url || !anonKey) return;
    const client = createBrowserClient(url, anonKey);
    let refreshTimer: number | undefined;
    const refresh = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => router.refresh(), 120);
    };
    const receive = (event: { new: { sender_id?: string } }) => {
      if (peer && event.new.sender_id === peer) void markConversationRead(peer).catch(() => {});
      refresh();
    };
    const channel = client.channel('hub:' + userId + ':' + (peer ?? (notifications ? 'notifications' : 'inbox')) + ':' + crypto.randomUUID());
    if (notifications) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: 'user_id=eq.' + userId }, refresh);
    } else {
      channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'recipient_id=eq.' + userId }, receive)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: 'sender_id=eq.' + userId }, refresh);
    }
    let connected = false;
    channel.subscribe(status => {
      connected = status === 'SUBSCRIBED';
      if (connected) refresh();
    });
    const retry = window.setInterval(() => {
      if (!connected && document.visibilityState === 'visible') refresh();
    }, 10_000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(retry);
      window.clearTimeout(refreshTimer);
      window.removeEventListener('focus', refresh);
      void client.removeChannel(channel);
    };
  }, [url, anonKey, userId, peer, notifications, router]);
  return null;
}
