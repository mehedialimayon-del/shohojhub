'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

const noSubscription = () => () => {};
const pushAvailable = () => window.isSecureContext && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const serverPushAvailable = () => false;

export default function PushPreference({ keyValue }: { keyValue: string }) {
  const [subscribed, setSubscribed] = useState(false);
  const supported = useSyncExternalStore(noSubscription, pushAvailable, serverPushAvailable);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (supported) void navigator.serviceWorker.getRegistration('/').then(async worker => {
      if (worker && await worker.pushManager.getSubscription()) setSubscribed(true);
    }).catch(() => {});
  }, [supported]);

  async function change() {
    setBusy(true);
    setStatus('');
    try {
      const worker = await navigator.serviceWorker.register('/notification-worker.js');
      const existing = await worker.pushManager.getSubscription();
      if (subscribed && existing) {
        const removed = await fetch('/api/push', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(existing) });
        if (!removed.ok) throw new Error();
        await existing.unsubscribe();
        setSubscribed(false);
        setStatus('এই ডিভাইসে পুশ নোটিফিকেশন বন্ধ।');
      } else {
        const active = await navigator.serviceWorker.ready;
        const subscription = existing ?? await active.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyValue });
        const saved = await fetch('/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(subscription) });
        if (!saved.ok) {
          if (!existing) await subscription.unsubscribe();
          throw new Error();
        }
        setSubscribed(true);
        setStatus('এই ডিভাইসে পুশ নোটিফিকেশন চালু।');
      }
    } catch {
      setStatus('ডিভাইসের পুশ সেটিং পরিবর্তন করা যায়নি।');
    } finally {
      setBusy(false);
    }
  }

  if (!keyValue || !supported) return null;
  return <div className="mb-4">
    <button type="button" className="hub-button hub-button-outline" disabled={busy} onClick={change}>
      {subscribed ? 'এই ডিভাইসের পুশ বন্ধ করুন' : 'এই ডিভাইসে পুশ চালু করুন'}
    </button>
    {status && <p role="status" className="mt-2">{status}</p>}
  </div>;
}
