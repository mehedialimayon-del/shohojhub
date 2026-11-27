'use client';

import { useEffect, useState } from 'react';

const bangladeshClock = new Intl.DateTimeFormat('bn-BD', {
  timeZone: 'Asia/Dhaka',
  dateStyle: 'full',
  timeStyle: 'medium',
});

export const formatBangladeshTime = (date: Date) => bangladeshClock.format(date);

export default function BangladeshLiveClock({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setNow(new Date());
    const initial = setTimeout(update, 0);
    const timer = setInterval(update, 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, []);

  const compactTime = now ? new Intl.DateTimeFormat('bn-BD', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' }).format(now) : 'বাংলাদেশ সময়';
  return <time dateTime={now?.toISOString()} className={compact ? 'ticker-time-value' : 'text-sm tabular-nums'}>
    {compact ? compactTime : now ? formatBangladeshTime(now) : 'বাংলাদেশ সময়'}
  </time>;
}
