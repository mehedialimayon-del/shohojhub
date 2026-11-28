'use client';

import { useState } from 'react';

export default function PublicPostLocation({ initialLat, initialLng }: { initialLat?: number | null; initialLng?: number | null }) {
  const [lat,setLat] = useState(initialLat?.toString() ?? '');
  const [lng,setLng] = useState(initialLng?.toString() ?? '');
  const [status,setStatus] = useState('');
  function currentLocation() {
    if (!navigator.geolocation) { setStatus('এই ব্রাউজারে অবস্থান পাওয়া যায় না।'); return; }
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setLat(coords.latitude.toFixed(3));
      setLng(coords.longitude.toFixed(3));
      setStatus('অবস্থান যোগ হয়েছে। প্রকাশের আগে মান যাচাই করুন।');
    }, () => setStatus('অবস্থান পাওয়া যায়নি। চাইলে নিজে স্থানাঙ্ক লিখুন।'), { timeout:8000, maximumAge:60_000 });
  }
  return <details>
    <summary className="cursor-pointer font-semibold">সবার জন্য ম্যাপ পিন (ঐচ্ছিক)</summary>
    <p className="my-2 text-sm">ব্যবসা বা বিজ্ঞাপনের প্রকাশযোগ্য স্থান দিন। অনুমোদিত পোস্টে পিন দেখা যাবে।</p>
    <div className="grid grid-cols-2 gap-2">
      <label>অক্ষাংশ<input name="mapLat" inputMode="decimal" value={lat} onChange={event => setLat(event.target.value)} /></label>
      <label>দ্রাঘিমাংশ<input name="mapLng" inputMode="decimal" value={lng} onChange={event => setLng(event.target.value)} /></label>
    </div>
    <label className="my-2 flex items-start gap-2"><input name="publicPin" type="checkbox" defaultChecked={Boolean(initialLat && initialLng)} /> প্রকাশিত হলে পিনটি সবার জন্য দৃশ্যমান রাখতে রাজি</label>
    <button type="button" className="hub-button hub-button-outline" onClick={currentLocation}>এই ডিভাইসের অবস্থান ব্যবহার</button>
    {status && <p role="status">{status}</p>}
  </details>;
}
