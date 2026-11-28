import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Bookmark, BriefcaseBusiness, FileText, GraduationCap, Maximize2, Search, UserRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { districtGroups, loadDistricts } from '@/lib/districts';
import { publicListings } from '@/lib/public-listings';
import ListingCards from './ListingCards';

async function getListings(kind: 'jobs' | 'tuition', params: Record<string, string | string[] | undefined>) {
  const text = (key: string) => typeof params[key] === 'string' ? params[key] as string : '';
  const division = text('division');
  const q = text('q').trim().slice(0,80);
  const selectedDistrict = text('district');
  const min = /^\d{1,10}$/.test(text('min')) ? Number(text('min')) : undefined;
  const offset = /^\d{1,3}$/.test(text('offset')) ? Math.min(Number(text('offset')),500) : 0;
  const client = await createClient().catch(() => null);
  const districts = await loadDistricts(client);
  const district = districts.find(row => row.id === selectedDistrict && (!division || row.division === division));
  const listings = await publicListings(client, { category: kind, q, district: district?.district, min, offset });
  return { q, district, districts, min, offset, ...listings };
}

export default async function FixedListingScreen({ kind, params }: {
  kind: 'jobs' | 'tuition'; params: Record<string,string|string[]|undefined>;
}) {
  const { q, district, districts, min, offset, rows, failed, next } = await getListings(kind,params);
  const jobs = kind === 'jobs';
  const expanded = params.view === 'full';
  const route = '/' + kind;
  const title = jobs ? 'চাকরিচাই' : 'পড়াই · টিউশন';
  const Icon = jobs ? BriefcaseBusiness : GraduationCap;
  const query = new URLSearchParams();
  if (q) query.set('q',q);
  if (district) query.set('district',district.id);
  if (min) query.set('min',String(min));
  function url(extras: Record<string,string>) {
    const combined = new URLSearchParams(query);
    Object.entries(extras).forEach(([k,v]) => combined.set(k,v));
    return route + '?' + combined;
  }
  const tabs = jobs ? ['সরকারি','বেসরকারি','ব্যাংক','NGO','পার্টটাইম','বিদেশে চাকরি'] : ['স্কুল','কলেজ','ভর্তি','অনলাইন','গণিত','ইংরেজি'];
  const sponsor = rows.find(row => row.has_photo);

  return <main className={'fixed-listing-frame hub-width' + (expanded ? ' is-expanded' : '') + (jobs ? ' jobs-reference' : ' tuition-reference')}>
    <header className="fixed-listing-controls">
      <div className="fixed-listing-title"><Link href="/modules" aria-label="মডিউলে ফিরুন"><ArrowLeft /></Link><Icon aria-hidden /><h1>{title}</h1>
        <Link href={url({ view: expanded ? 'compact' : 'full' })} className="fixed-full-button"><Maximize2 size={16} />{expanded ? 'সাধারণ ভিউ' : 'বড় ভিউ'}</Link></div>
      {!expanded && <>
        <form className="fixed-listing-search">
          <label className="sr-only" htmlFor={kind + '-search'}>পদ, প্রতিষ্ঠান ও লোকেশন খুঁজুন</label>
          <input name="q" type="search" id={kind + '-search'} placeholder="পদ, প্রতিষ্ঠান ও লোকেশন খুঁজুন…" defaultValue={q} maxLength={80} />
          <label className="sr-only" htmlFor={kind + '-district'}>জেলা</label>
          <select name="district" id={kind + '-district'} defaultValue={district?.id ?? ''}>
            <option value="">সব জেলা</option>{Array.from(districtGroups(districts), ([division,entries]) => <optgroup key={division} label={division}>
              {entries.map(row => <option key={row.id} value={row.id}>{row.district}</option>)}
            </optgroup>)}
          </select>
          <label className="sr-only" htmlFor={kind + '-min'}>সর্বনিম্ন বাজেট</label>
          <input name="min" id={kind + '-min'} type="number" min="0" max="9999999999" placeholder="বাজেট" defaultValue={min} />
          <button aria-label="খুঁজুন" type="submit"><Search size={19} /></button>
        </form>
        <nav className="fixed-listing-tabs" aria-label={title + ' বিভাগ'}>{tabs.map(tab => <Link href={url({ q:tab })} key={tab} aria-current={q === tab ? 'page' : undefined}>{tab}</Link>)}</nav>
        <section className="fixed-listing-promo" aria-label={title + ' ব্যানার'}>
          {sponsor && <Image fill unoptimized src={'/api/posts/' + sponsor.id + '/photo'} alt="" />}
          <div><strong>{sponsor ? sponsor.title : jobs ? 'পছন্দের চাকরি খুঁজুন সহজে' : 'পছন্দের টিউশন খুঁজুন সহজে'}</strong>
            {sponsor && <Link href={'/posts/' + sponsor.id} className="fixed-result-open">বিস্তারিত দেখুন</Link>}</div>
        </section>
        <nav className="fixed-listing-quick" aria-label={title + ' দ্রুত কাজ'}>
          <Link href="/dashboard"><FileText aria-hidden />আমার ড্যাশবোর্ড</Link><Link href="/posts/manage"><Bookmark aria-hidden />আমার পোস্ট</Link>
          <Link href="/account"><UserRound aria-hidden />আমার প্রোফাইল</Link><Link href="/posts/new?intent=need"><Icon aria-hidden />নতুন পোস্ট</Link>
        </nav>
      </>}
      <div className="fixed-results-label"><strong>{jobs ? 'সর্বশেষ চাকরি' : 'সর্বশেষ টিউশন'}</strong>{q && <Link href={route}>ফিল্টার সরান</Link>}</div>
    </header>
    <section className="fixed-listing-scroll" tabIndex={0} aria-label="স্ক্রলযোগ্য ফলাফল">
      <ListingCards rows={rows} failed={failed} />
      <nav className="flex gap-2 my-2" aria-label="ফলাফলের পাতা">
        {offset > 0 && <Link href={url({ offset:String(Math.max(0,offset-23)) })}>আগের পাতা</Link>}
        {next && offset < 500 && <Link href={url({ offset:String(offset + 23) })}>পরের পাতা</Link>}
      </nav>
    </section>
  </main>;
}
