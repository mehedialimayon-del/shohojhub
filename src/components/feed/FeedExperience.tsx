'use client';

import Link from 'next/link';
import Image from 'next/image';
import { postIntents, divisions as divisionNames, type Post } from '@/lib/feed';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  BriefcaseBusiness, Check, ChevronDown, Clock3, GraduationCap, Grid2X2, House, MapPin,
  Radio, RotateCcw, Search, ShoppingBag, SlidersHorizontal, Tag, Wrench, X,
} from 'lucide-react';

const categories = [
  { name: 'চাকরি', key: 'jobs', icon: BriefcaseBusiness }, { name: 'টিউশন', key: 'tuition', icon: GraduationCap },
  { name: 'পণ্য', key: 'products', icon: ShoppingBag }, { name: 'সেবা', key: 'services', icon: Wrench },
  { name: 'বাসা ভাড়া', key: 'rentals', icon: House }, { name: 'শিক্ষা/ভর্তি', key: 'education', icon: GraduationCap },
  { name: 'বিদেশে পড়াশোনা', key: 'study_abroad', icon: Radio }, { name: 'অফার/ডিল', key: 'deals', icon: Tag },
];
const divisions = ['বিভাগ নির্বাচন করুন', ...divisionNames];
const postFilters = [{ label: 'ব্যক্তিগত', key: 'personal' }, { label: 'ব্যবসায়িক', key: 'business' }, { label: 'স্পনসরড', key: 'sponsored' }];
const feedTabs = [{ name: 'সব পোস্ট', key: '' }, { name: 'চাকরি', key: 'jobs' }, { name: 'টিউশন', key: 'tuition' }, { name: 'পণ্য', key: 'products' }, { name: 'সেবা', key: 'services' }, { name: 'অফার', key: 'deals' }, { name: 'শিক্ষা', key: 'education' }];
const categoryLabel = Object.fromEntries(categories.map((item) => [item.key, item.name]));
const price = new Intl.NumberFormat('bn-BD', { maximumFractionDigits: 0 });

export type FeedPost = Post;
export type FeedQuery = { category: string; categories: string[]; division: string; district: string; area: string; min: string; max: string; types: string[]; q: string; intent: string };

export default function FeedExperience({ initial, posts, count, unavailable, page, nextPage, autoOpen }: {
  initial: FeedQuery; posts: FeedPost[]; count: number; unavailable: boolean; page: number; nextPage: boolean; autoOpen: boolean;
}) {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(autoOpen);
  const [category, setCategory] = useState(initial.category);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initial.categories);
  const [postTypes, setPostTypes] = useState<string[]>(initial.types);
  const [division, setDivision] = useState(initial.division || divisions[0]);
  const [district, setDistrict] = useState(initial.district || 'জেলা নির্বাচন করুন');
  const [area, setArea] = useState(initial.area || 'উপজেলা/এলাকা');
  const [minimum, setMinimum] = useState(initial.min);
  const [maximum, setMaximum] = useState(initial.max);
  const invalidRange = Boolean(minimum && maximum && Number(minimum) > Number(maximum));
  const [query, setQuery] = useState(initial.q);
  const [intent, setIntent] = useState(initial.intent);

  const selectedCount = selectedCategories.length + Number(Boolean(division !== divisions[0] || (district !== 'জেলা নির্বাচন করুন' && district) || (area !== 'উপজেলা/এলাকা' && area))) + Number(Boolean(minimum || maximum)) + Number(postTypes.length > 0);
  const resultLabel = useMemo(() => initial.q ? `“${initial.q}” খোঁজার ফলাফল` : category ? `${categoryLabel[category] ?? 'নির্বাচিত'} পোস্ট` : selectedCategories.length ? 'নির্বাচিত ক্যাটাগরির পোস্ট' : 'প্রকাশিত পোস্ট', [initial.q, category, selectedCategories.length]);

  function navigate(next: Partial<FeedQuery> = {}, targetPage = 1) {
    const state = { ...initial, intent, category, categories: selectedCategories, division: division === divisions[0] ? '' : division, district: district === 'জেলা নির্বাচন করুন' ? '' : district, area: area === 'উপজেলা/এলাকা' ? '' : area, min: minimum, max: maximum, types: postTypes, q: query.trim(), ...next };
    const params = new URLSearchParams();
    if (state.category) params.set('category', state.category);
    if (state.categories.length) params.set('categories', state.categories.join(','));
    if (state.division) params.set('division', state.division);
    if (state.district) params.set('district', state.district);
    if (state.area) params.set('area', state.area);
    if (state.min) params.set('min', state.min);
    if (state.max) params.set('max', state.max);
    if (state.types.length) params.set('types', state.types.join(','));
    if (state.q) params.set('q', state.q);
    if (state.intent) params.set('intent', state.intent);
    if (targetPage > 1) params.set('page', String(targetPage));
    router.push(`/feed${params.size ? `?${params.toString()}` : ''}`, { scroll: false });
  }

  function resetFilters() {
    setDivision(divisions[0]); setDistrict('জেলা নির্বাচন করুন'); setArea('উপজেলা/এলাকা');
    setSelectedCategories([]); setMinimum(''); setMaximum(''); setPostTypes([]); setCategory(''); setQuery(''); setIntent('');
  }

  return (
    <main className="hub-width page-content feed-page">
      <section className="feed-search-stack" aria-label="লাইভ ফিড সার্চ ও ফিল্টার">
        <form className="feed-search" onSubmit={(event) => { event.preventDefault(); navigate({ q: query.trim() }); }}>
          <Search size={20} aria-hidden /><label className="sr-only" htmlFor="feed-search-input">ফিডে খুঁজুন</label>
          <input id="feed-search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ফিডের মধ্যে খুঁজুন (চাকরি, টিউশন, পণ্য, সেবা...)" />
          {query && <button type="button" aria-label="সার্চ মুছুন" onClick={() => { setQuery(''); navigate({ q: '' }); }}><X size={17} /></button>}
        </form>
        <div className="feed-toolbar">
          <button type="button" className="feed-select-pill" aria-label="এলাকা বেছে নিন" onClick={() => setFilterOpen(true)}><MapPin size={16} />{division === divisions[0] ? 'সারা বাংলাদেশ' : division}<ChevronDown size={14} /></button>
          <button type="button" className="feed-select-pill" aria-label="ক্যাটাগরি বেছে নিন" onClick={() => setFilterOpen(true)}><Grid2X2 size={16} />{category ? categoryLabel[category] : 'সব ক্যাটাগরি'}<ChevronDown size={14} /></button>
          <button type="button" className="feed-filter-button" onClick={() => setFilterOpen(true)}><SlidersHorizontal size={18} />ফিল্টার{selectedCount > 0 && <span>{selectedCount}</span>}</button>
        </div>
      </section>

      <nav className="feed-category-tabs" aria-label="পোস্টের ধরন">
        {feedTabs.map((item) => <button key={item.name} type="button" className={category === item.key ? 'active' : ''} aria-pressed={category === item.key} onClick={() => { setCategory(item.key); setSelectedCategories([]); navigate({ category: item.key, categories: [] }); }}>{item.name}</button>)}
      </nav>

      <div className="flex flex-wrap gap-2 my-3" role="group" aria-label="পোস্টের উদ্দেশ্য">
        {([['', 'সব উদ্দেশ্য'], ...Object.entries(postIntents)]).map(([key, label]) =>
          <button type="button" key={key} className="filter-pill" aria-pressed={intent === key}
            onClick={() => { setIntent(key); navigate({ intent: key }); }}>{label}</button>)}
      </div>
      <div className="feed-results-heading"><div><span><Radio size={19} /> লাইভ আপডেট</span><strong>{resultLabel}</strong></div><span className="feed-result-count">{unavailable ? 'লোড করা যায়নি' : `${price.format(count)}টি ফলাফল`}</span></div>
      <div className="feed-create-row"><p>প্রকাশিত ও যাচাইকৃত পোস্ট এখানে দেখা যাবে।</p><Link href="/posts/new" className="hub-button">＋ পোস্ট দিন</Link></div>

      <div className="feed-scroll-contents" tabIndex={0} aria-label="স্ক্রলযোগ্য পূর্ণ লাইভ ফিড">
      {unavailable ? <section className="feed-empty feed-empty-page" role="alert"><span className="feed-empty-icon"><Radio size={23} /></span><div><strong>ফিড এখন লোড করা যাচ্ছে না</strong><p>সংযোগ ঠিক হলে আবার চেষ্টা করুন।</p></div><button className="hub-button hub-button-outline" type="button" onClick={() => router.refresh()}>আবার চেষ্টা</button></section> : posts.length === 0 ? <section className="feed-empty feed-empty-page" aria-live="polite"><span className="feed-empty-icon"><Radio size={23} /></span><div><strong>এখনো কোনো প্রকাশিত পোস্ট নেই</strong><p>পোস্ট জমা দিন; রিভিউ শেষে অনুমোদিত হলে এখানে দেখা যাবে।</p></div><Link href="/posts/new" className="hub-button hub-button-outline">পোস্ট দিন</Link></section> : <section className="feed-post-list" aria-label="প্রকাশিত পোস্ট">
        {posts.map((post) => <article className="feed-post-card" key={post.id}>
          {post.has_photo ? <Image src={'/api/posts/' + post.id + '/photo'} unoptimized width={100} height={90}
            className="feed-post-photo" alt="" /> : <span className="feed-post-icon">{categories.find((item) => item.key === post.category)?.icon ? (() => { const Icon = categories.find((item) => item.key === post.category)!.icon; return <Icon size={25} />; })() : <Grid2X2 size={25} />}</span>}
          <div className="feed-post-content"><div className="feed-post-meta"><b>{categoryLabel[post.category] ?? 'পোস্ট'}</b><span>•</span><span>{post.post_type === 'business' ? 'ব্যবসায়িক' : post.post_type === 'sponsored' ? 'স্পনসরড' : 'ব্যক্তিগত'}</span></div>
            <h2><Link href={'/posts/' + post.id}>{post.title}</Link></h2><p>{post.body}</p><div className="feed-post-details"><span><MapPin size={14} />{[post.area, post.district, post.division].filter(Boolean).join(', ')}</span><span><Clock3 size={14} />{post.published_at ? new Date(post.published_at).toLocaleDateString('bn-BD') : ''}</span></div>
            {(post.price_min_paisa !== null || post.price_max_paisa !== null) && <strong className="feed-post-price">৳ {post.price_min_paisa !== null ? price.format(post.price_min_paisa / 100) : '—'}{post.price_max_paisa !== null ? ` – ${price.format(post.price_max_paisa / 100)}` : ''}</strong>}
            <div className="feed-post-contact">যোগাযোগ: {post.contact_name}</div>
          </div>
        </article>)}
      </section>}

      {!unavailable && (page > 1 || nextPage) && <nav className="flex gap-3 my-4" aria-label="ফিডের পাতা">
        {page > 1 && <button className="hub-button hub-button-outline" onClick={() => navigate({}, page - 1)}>আগের পাতা</button>}
        {nextPage && <button className="hub-button" onClick={() => navigate({}, page + 1)}>পরের পাতা</button>}
      </nav>}
      </div>
      <button className="feed-floating-filter" type="button" aria-label="বিস্তারিত ফিল্টার খুলুন" onClick={() => setFilterOpen(true)}><SlidersHorizontal size={23} /></button>

      {filterOpen && <div className="feed-filter-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) setFilterOpen(false); }}>
        <section className="feed-filter-sheet" role="dialog" aria-modal="true" aria-labelledby="feed-filter-title">
          <div className="feed-filter-heading"><span><SlidersHorizontal size={19} /><strong id="feed-filter-title">ফিল্টার করুন</strong></span><button type="button" aria-label="ফিল্টার বন্ধ করুন" onClick={() => setFilterOpen(false)}><X size={21} /></button></div>
          <div className="feed-filter-section"><h3><MapPin size={18} /> লোকেশন</h3><div className="feed-location-selects">
            <label><span className="sr-only">বিভাগ নির্বাচন</span><select value={division} onChange={(event) => { setDivision(event.target.value); setDistrict('জেলা নির্বাচন করুন'); setArea('উপজেলা/এলাকা'); }} aria-label="বিভাগ নির্বাচন করুন">{divisions.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
            <label><span className="sr-only">জেলা নির্বাচন</span><input aria-label="জেলা লিখুন" placeholder="জেলা লিখুন" value={district === 'জেলা নির্বাচন করুন' ? '' : district} onChange={(event) => setDistrict(event.target.value || 'জেলা নির্বাচন করুন')} /></label>
            <label><span className="sr-only">উপজেলা বা এলাকা</span><input aria-label="উপজেলা/এলাকা লিখুন" placeholder="এলাকা" value={area === 'উপজেলা/এলাকা' ? '' : area} onChange={(event) => setArea(event.target.value || 'উপজেলা/এলাকা')} /></label>
          </div></div>
          <div className="feed-filter-section"><h3><Grid2X2 size={18} /> ক্যাটাগরি <small>(একাধিক নির্বাচন করা যাবে)</small></h3><div className="feed-category-grid">
            {categories.map(({ name, key, icon: Icon }) => <button key={key} type="button" className={selectedCategories.includes(key) ? 'selected' : ''} aria-pressed={selectedCategories.includes(key)} onClick={() => setSelectedCategories((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key])}><Icon size={21} /><span>{name}</span>{selectedCategories.includes(key) && <Check size={15} className="category-check" />}</button>)}
          </div></div>
          <div className="feed-filter-section"><h3><Radio size={18} /> মূল্য সীমা (৳)</h3><div className="feed-price-range"><label><span className="sr-only">সর্বনিম্ন মূল্য</span><input inputMode="numeric" type="number" min="0" placeholder="সর্বনিম্ন" value={minimum} onChange={(event) => setMinimum(event.target.value)} /></label><span>—</span><label><span className="sr-only">সর্বোচ্চ মূল্য</span><input inputMode="numeric" type="number" min="0" placeholder="সর্বোচ্চ" value={maximum} onChange={(event) => setMaximum(event.target.value)} /></label></div></div>
          <div className="feed-filter-section feed-post-type"><h3><BriefcaseBusiness size={18} /> পোস্টের ধরন</h3><div>{postFilters.map(({ label, key }) => <label key={key}><input type="checkbox" checked={postTypes.includes(key)} onChange={(event) => setPostTypes((current) => event.target.checked ? [...current,key] : current.filter((item) => item !== key))} /><span>{label}</span></label>)}</div></div>
          {invalidRange && <p role="alert" className="py-2">সর্বনিম্ন মূল্য সর্বোচ্চ মূল্যের চেয়ে বেশি হতে পারে না।</p>}
          <div className="feed-filter-actions"><button type="button" className="hub-button hub-button-outline" onClick={resetFilters}><RotateCcw size={16} /> রিসেট</button><button type="button" className="hub-button" disabled={invalidRange} onClick={() => { setCategory(''); setFilterOpen(false); navigate({ category: '', categories: selectedCategories, division: division === divisions[0] ? '' : division, district: district === 'জেলা নির্বাচন করুন' ? '' : district, area: area === 'উপজেলা/এলাকা' ? '' : area, min: minimum, max: maximum, types: postTypes }); }}>ফলাফল দেখুন<Search size={17} /></button></div>
        </section>
      </div>}
    </main>
  );
}
