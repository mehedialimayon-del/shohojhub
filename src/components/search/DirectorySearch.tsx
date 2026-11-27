'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

type DirectoryEntry = {
  kind: 'university' | 'shop' | 'product';
  id: string;
  title: string;
  secondary_title: string;
  district: string;
};
const labels = { university: 'বিশ্ববিদ্যালয়', shop: 'দোকান', product: 'পণ্য' };
type SearchResult = { results: DirectoryEntry[]; next: number | null };

export default function DirectorySearch() {
  const [query, setQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [retry, setRetry] = useState(0);
  const term = query.trim();

  useEffect(() => {
    if (term.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: term, offset: String(offset) });
        const res = await fetch('/api/search?' + params, { signal: controller.signal });
        if (controller.signal.aborted) return;
        if (!res.ok) {
          setError(res.status === 429 ? 'অনেকবার খোঁজা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।' : 'এখন খোঁজা যাচ্ছে না। আবার চেষ্টা করুন।');
          return;
        }
        const data: SearchResult = await res.json();
        if (!controller.signal.aborted) setResult(data);
      } catch {
        if (!controller.signal.aborted) setError('সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      } finally {
        if (!controller.signal.aborted) setPending(false);
      }
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [term, offset, retry]);

  function changePage(page: number) {
    setOffset(page);
    setError('');
    setPending(true);
  }

  return (
    <section id="search" className="mt-8 max-w-xl" aria-label="সেবা খোঁজ">
      <label htmlFor="directory-search" className="mb-2 block font-semibold">খুঁজুন</label>
      <div className="relative">
        <Search size={19} className="absolute left-3 top-3.5 hub-accent" aria-hidden />
        <input className="hub-input hub-search-input" id="directory-search" type="search" value={query} maxLength={80}
          placeholder="নাম বা জেলা লিখুন" onChange={event => {
            const value = event.target.value;
            setQuery(value);
            if (value.trim() === term && offset === 0) return;
            setOffset(0);
            setResult(null);
            setError('');
            setPending(value.trim().length >= 2);
          }} />
      </div>
      <div className="mt-3 text-sm text-neutral-300" role="status">
        {term.length === 1 && 'অন্তত ২টি অক্ষর লিখুন।'}
        {pending && 'খোঁজা হচ্ছে…'}
        {error}
        {!pending && !error && result?.results.length === 0 && 'কোনো ফল পাওয়া যায়নি।'}
      </div>
      {error && <button className="hub-button hub-button-outline mt-3" onClick={() => { setError(''); setPending(true); setRetry(value => value + 1); }}>আবার খুঁজুন</button>}
      {result && !error && result.results.length > 0 && (
        <>
          <ul className="mt-3 grid gap-2" aria-busy={pending}>
            {result.results.map(item => (
              <li className="hub-card" key={item.kind + ':' + item.id}>
                <span className="mb-1 block text-xs text-neutral-300">{labels[item.kind]}</span>
                <strong>{item.title}</strong>
                <span className="block text-sm text-neutral-300">{item.secondary_title}</span>
                <span className="block text-sm text-neutral-300">{item.district}</span>
              </li>
            ))}
          </ul>
          {(offset > 0 || result.next !== null) && <div className="mt-3 flex gap-2">
            {offset > 0 && <button className="hub-button hub-button-outline" disabled={pending} onClick={() => changePage(offset - 20)}>আগের পাতা</button>}
            {result.next !== null && <button className="hub-button hub-button-outline" disabled={pending} onClick={() => changePage(result.next!)}>পরের পাতা</button>}
          </div>}
        </>
      )}
    </section>
  );
}
