'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { markConversationRead } from '@/app/connect/actions';

export default function ConnectRealtime({ url, anonKey, userId, peer, shouldMarkRead }: {
  url: string; anonKey: string; userId: string; peer?: string; shouldMarkRead?: boolean;
}) {
  const router = useRouter();
  useEffect(() => {
    if (peer && shouldMarkRead) void markConversationRead(peer).then(() => router.refresh()).catch(() => {});
  }, [peer, shouldMarkRead, router]);

  useEffect(() => {
    if (!url || !anonKey) return;
    const client = createBrowserClient(url, anonKey, { isSingleton: false });
    let refreshTimer: number | undefined;
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => router.refresh(), 120);
    };
    const channel = client.channel('shohojhub:account:' + userId, { config: { private: true } })
      .on('broadcast', { event: 'conversation_changed' }, refresh);
    let active = true;
    let connected = false;
    void client.realtime.setAuth().then(() => {
      if (active) channel.subscribe(status => { connected = status === 'SUBSCRIBED'; if (connected) refresh(); });
    }).catch(() => {});
    const retry = window.setInterval(() => { if (!connected) refresh(); }, 8_000);
    window.addEventListener('focus', refresh);
    return () => {
      active = false;
      window.clearInterval(retry);
      window.clearTimeout(refreshTimer);
      window.removeEventListener('focus', refresh);
      void client.removeChannel(channel);
      void client.auth.stopAutoRefresh();
    };
  }, [url, anonKey, userId, router]);
  return null;
}
