'use client';

import { useEffect, useState } from 'react';

const bangladeshClock = new Intl.DateTimeFormat('bn-BD', {
  timeZone: 'Asia/Dhaka',
  dateStyle: 'full',
  timeStyle: 'medium',
});

export const formatBangladeshTime = (date: Date) => bangladeshClock.format(date);

export default function BangladeshLiveClock() {
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

  return <time dateTime={now?.toISOString()} className="text-sm tabular-nums">
    {now ? formatBangladeshTime(now) : 'বাংলাদেশ সময়'}
  </time>;
}
