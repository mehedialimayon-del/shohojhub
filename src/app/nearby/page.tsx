import Link from 'next/link';
import { ArrowLeft, Grid2X2, LocateFixed, Search, SlidersHorizontal } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { districtGroups, loadDistricts } from '@/lib/districts';
import { postCategories } from '@/lib/feed';
import { publicListings } from '@/lib/public-listings';
import ListingCards from '@/components/listings/ListingCards';
import NearbyMap from '@/components/listings/NearbyMap';

const tiles = [
  ['', 'সবকিছু'], ['products','পণ্য'], ['services','সেবা'], ['jobs','চাকরি'], ['education','শিক্ষা'], ['rentals','বাসা/ভাড়া'], ['tuition','টিউশন'],
];

export default async function Nearby({ searchParams }: { searchParams: Promise<{ district?: string; q?: string; category?: string; offset?: string }> }) {
  const client = await createClient().catch(() => null);
  const { district, q, category, offset } = await searchParams;
  const [districts, preference] = await Promise.all([
    loadDistricts(client),
    !district && client ? client.from('member_preferences').select('district_id').maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const selected = districts.find(row => row.id === (district ?? preference.data?.district_id));
  const kind = typeof category === 'string' && Object.hasOwn(postCategories,category) ? category : '';
  const keyword = typeof q === 'string' ? q.trim().slice(0,80) : '';
  const pageOffset = typeof offset === 'string' && /^\d{1,3}$/.test(offset) ? Math.min(500,Number(offset)) : 0;
  const { rows, failed, next } = await publicListings(client, { map:true, category:kind, district:selected?.district, q:keyword, offset:pageOffset });
  function href(value: string, page = 0) {
    const params = new URLSearchParams();
    if (selected) params.set('district',selected.id);
    if (keyword) params.set('q',keyword);
    if (value) params.set('category',value);
    if (page) params.set('offset',String(page));
    return '/nearby?' + params;
  }

  return <main className="fixed-listing-frame nearby-frame hub-width">
    <header className="fixed-listing-controls">
      <div className="fixed-listing-title"><Link href="/" aria-label="হোমে ফিরুন"><ArrowLeft /></Link><LocateFixed aria-hidden /><h1>কাছাকাছি সেবা ও পোস্ট</h1></div>
      <form className="fixed-listing-search">
        <label className="sr-only" htmlFor="nearby-keyword">কাছাকাছি খুঁজুন</label>
        <input id="nearby-keyword" type="search" name="q" placeholder="পণ্য, সেবা, চাকরি বা পোস্ট খুঁজুন…" defaultValue={keyword} maxLength={80} />
        <label className="sr-only" htmlFor="nearby-district">জেলা বেছে নিন</label>
        <select id="nearby-district" name="district" defaultValue={selected?.id ?? ''}>
          <option value="">সারা বাংলাদেশ</option>
          {Array.from(districtGroups(districts), ([division, entries]) => <optgroup label={division} key={division}>
            {entries.map(entry => <option key={entry.id} value={entry.id}>{entry.district}</option>)}
          </optgroup>)}
        </select>
        {kind && <input type="hidden" name="category" value={kind} />}
        <button type="submit" aria-label="কাছাকাছি ফলাফল খুঁজুন"><Search size={19} /></button>
      </form>
      <nav className="fixed-listing-tabs" aria-label="কাছাকাছি ক্যাটাগরি">
        {tiles.map(([value,label]) => <Link href={href(value)} key={value} aria-current={kind === value ? 'page' : undefined}>{label}</Link>)}
      </nav>
    </header>
    <NearbyMap points={rows.filter(row => row.map_lat !== null && row.map_lng !== null)} />
    <div className="fixed-results-label"><strong>নিকটবর্তী ফলাফল{selected ? ' · ' + selected.district : ''}</strong>
      <span><Grid2X2 size={15} />{rows.length}টি এই পাতায়</span><Link href="/nearby"><SlidersHorizontal size={15} /> রিসেট</Link>
    </div>
    <section className="fixed-listing-scroll" tabIndex={0} aria-label="স্ক্রলযোগ্য কাছাকাছি ফলাফল">
      <ListingCards rows={rows} failed={failed} />
      <nav className="flex gap-2 my-2" aria-label="কাছাকাছি ফলাফলের পাতা">
        {pageOffset > 0 && <Link href={href(kind,Math.max(0,pageOffset-23))}>আগের পাতা</Link>}
        {next && pageOffset < 500 && <Link href={href(kind,pageOffset+23)}>পরের পাতা</Link>}
      </nav>
    </section>
  </main>;
}
