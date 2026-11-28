import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { districtGroups, loadDistricts } from '@/lib/districts';
import DirectorySearch from '@/components/search/DirectorySearch';

export const dynamic = 'force-dynamic';

export default async function Nearby({ searchParams }: { searchParams: Promise<{ district?: string }> }) {
  const client = await createClient().catch(() => null);
  const { district } = await searchParams;
  const districts = await loadDistricts(client);
  const { data: preference } = !district && client
    ? await client.from('member_preferences').select('district_id').maybeSingle() : { data: null };
  const selected = districts.find(row => row.id === (district ?? preference?.district_id));
  const query = new URLSearchParams(selected ? { division: selected.division, district: selected.district } : {});

  return <main className="hub-width page-content">
    <h1 className="mb-4 text-2xl font-bold">কাছাকাছি সেবা ও পোস্ট</h1>
    <form className="hub-card post-form">
      <label>জেলা বেছে নিন<select required name="district" defaultValue={selected?.id ?? ''}>
        <option value="">জেলা বেছে নিন</option>
        {Array.from(districtGroups(districts), ([division, entries]) => <optgroup label={division} key={division}>
          {entries.map(entry => <option key={entry.id} value={entry.id}>{entry.district}</option>)}
        </optgroup>)}
      </select></label>
      <button type="submit" className="hub-button" disabled={!districts.length}>এই জেলা দেখুন</button>
      {!districts.length && <p role="status">জেলার তালিকা এখন পাওয়া যাচ্ছে না।</p>}
    </form>
    {selected && <section className="hub-card mt-4">
      <h2 className="mb-3 text-lg font-bold">{selected.district} · {selected.division}</h2>
      <div className="flex flex-wrap gap-2">
        <Link className="hub-button" href={'/feed?' + query}>সব স্থানীয় পোস্ট</Link>
        <Link className="hub-button hub-button-outline" href={'/feed?category=services&' + query}>সেবা</Link>
        <Link className="hub-button hub-button-outline" href={'/feed?category=jobs&' + query}>চাকরি</Link>
        <Link className="hub-button hub-button-outline" href={'/feed?category=products&' + query}>পণ্য</Link>
      </div>
      <div className="mt-4"><DirectorySearch key={selected.id} district={selected.district} /></div>
    </section>}
  </main>;
}
