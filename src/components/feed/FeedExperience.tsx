'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  BriefcaseBusiness, Check, ChevronDown, GraduationCap, Grid2X2, House, MapPin,
  Radio, RotateCcw, Search, ShoppingBag, SlidersHorizontal, Tag, Wrench, X,
} from 'lucide-react';

const categories = [
  { name: 'চাকরি', icon: BriefcaseBusiness },
  { name: 'টিউশন', icon: GraduationCap },
  { name: 'পণ্য', icon: ShoppingBag },
  { name: 'সেবা', icon: Wrench },
  { name: 'বাসা ভাড়া', icon: House },
  { name: 'শিক্ষা/ভর্তি', icon: GraduationCap },
  { name: 'বিদেশে পড়াশোনা', icon: Radio },
  { name: 'অফার/ডিল', icon: Tag },
];
const divisions = ['বিভাগ নির্বাচন করুন', 'ঢাকা', 'চট্টগ্রাম', 'রংপুর', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'ময়মনসিংহ'];
const postFilters = ['সব পোস্ট', 'ব্যক্তিগত', 'ব্যবসায়িক', 'স্পনসরড'];
const feedTabs = ['সব পোস্ট', 'চাকরি', 'টিউশন', 'পণ্য', 'সেবা', 'অফার', 'শিক্ষা'];

export default function FeedExperience({ initialCategory, initialFilters }: { initialCategory?: string; initialFilters?: string }) {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(initialFilters === '1');
  const [category, setCategory] = useState(initialCategory || 'সব পোস্ট');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [postTypes, setPostTypes] = useState(['সব পোস্ট']);
  const [division, setDivision] = useState(divisions[0]);
  const [district, setDistrict] = useState('জেলা নির্বাচন করুন');
  const [area, setArea] = useState('উপজেলা/এলাকা');
  const [minimum, setMinimum] = useState('');
  const [maximum, setMaximum] = useState('');
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const selectedCount = selectedCategories.length + Number(division !== divisions[0] || district !== 'জেলা নির্বাচন করুন' || area !== 'উপজেলা/এলাকা') + Number(Boolean(minimum || maximum)) + Number(!(postTypes.length === 1 && postTypes[0] === 'সব পোস্ট'));
  const resultLabel = useMemo(() => {
    if (submittedQuery) return `“${submittedQuery}” খোঁজার ফলাফল`;
    return category === 'সব পোস্ট' ? 'প্রকাশিত পোস্ট' : `${category} পোস্ট`;
  }, [category, submittedQuery]);

  function toggleCategory(name: string) {
    setSelectedCategories((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  }

  function resetFilters() {
    setDivision(divisions[0]);
    setDistrict('জেলা নির্বাচন করুন');
    setArea('উপজেলা/এলাকা');
    setSelectedCategories([]);
    setMinimum('');
    setMaximum('');
    setPostTypes(['সব পোস্ট']);
  }

  function closeFilters() {
    setFilterOpen(false);
    router.replace(category === 'সব পোস্ট' ? '/feed' : `/feed?category=${encodeURIComponent(category)}`, { scroll: false });
  }

  return (
    <div className="hub-width page-content feed-page">
      <section className="feed-search-stack" aria-label="লাইভ ফিড সার্চ ও ফিল্টার">
        <form className="feed-search" onSubmit={(event) => { event.preventDefault(); setSubmittedQuery(query.trim()); }}>
          <Search size={20} aria-hidden />
          <label className="sr-only" htmlFor="feed-search-input">ফিডে খুঁজুন</label>
          <input id="feed-search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ফিডের মধ্যে খুঁজুন (চাকরি, টিউশন, পণ্য, সেবা...)" />
          {query && <button type="button" aria-label="সার্চ মুছুন" onClick={() => { setQuery(''); setSubmittedQuery(''); }}><X size={17} /></button>}
        </form>
        <div className="feed-toolbar">
          <button type="button" className="feed-select-pill" aria-label="এলাকা বেছে নিন" onClick={() => setFilterOpen(true)}><MapPin size={16} />{division === divisions[0] ? 'সারা বাংলাদেশ' : division}<ChevronDown size={14} /></button>
          <button type="button" className="feed-select-pill" aria-label="ক্যাটাগরি বেছে নিন" onClick={() => setFilterOpen(true)}><Grid2X2 size={16} />{category === 'সব পোস্ট' ? 'সব ক্যাটাগরি' : category}<ChevronDown size={14} /></button>
          <button type="button" className="feed-filter-button" onClick={() => { setFilterOpen(true); router.replace('/feed?filters=1', { scroll: false }); }}><SlidersHorizontal size={18} />ফিল্টার{selectedCount > 0 && <span>{selectedCount}</span>}</button>
        </div>
      </section>

      <nav className="feed-category-tabs" aria-label="পোস্টের ধরন">
        {feedTabs.map((item) => (
          <button key={item} type="button" className={category === item ? 'active' : ''} aria-pressed={category === item} onClick={() => { setCategory(item); setSubmittedQuery(''); }}>{item}</button>
        ))}
      </nav>

      <div className="feed-results-heading"><div><span><Radio size={19} /> লাইভ আপডেট</span><strong>{resultLabel}</strong></div><span className="feed-result-count">০টি ফলাফল</span></div>

      <section className="feed-empty feed-empty-page" aria-live="polite">
        <span className="feed-empty-icon"><Radio size={23} /></span>
        <div><strong>এখনো কোনো প্রকাশিত পোস্ট নেই</strong><p>যাচাইকৃত পোস্ট, পণ্য বা সেবার বিজ্ঞপ্তি প্রকাশিত হলে এখানে দেখাবে।</p></div>
        <Link href="/modules" className="hub-button hub-button-outline">মডিউল দেখুন</Link>
      </section>

      <button className="feed-floating-filter" type="button" aria-label="বিস্তারিত ফিল্টার খুলুন" onClick={() => { setFilterOpen(true); router.replace('/feed?filters=1', { scroll: false }); }}><SlidersHorizontal size={23} /></button>

      {filterOpen && <div className="feed-filter-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) closeFilters(); }}>
        <section className="feed-filter-sheet" role="dialog" aria-modal="true" aria-labelledby="feed-filter-title">
          <div className="feed-filter-heading"><span><SlidersHorizontal size={19} /><strong id="feed-filter-title">ফিল্টার করুন</strong></span><button type="button" aria-label="ফিল্টার বন্ধ করুন" onClick={closeFilters}><X size={21} /></button></div>

          <div className="feed-filter-section">
            <h3><MapPin size={18} /> লোকেশন</h3>
            <div className="feed-location-selects">
              <label><span className="sr-only">বিভাগ নির্বাচন</span><select value={division} onChange={(event) => { setDivision(event.target.value); setDistrict('জেলা নির্বাচন করুন'); setArea('উপজেলা/এলাকা'); }} aria-label="বিভাগ নির্বাচন করুন">{divisions.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
              <label><span className="sr-only">জেলা নির্বাচন</span><select value={district} onChange={(event) => setDistrict(event.target.value)} aria-label="জেলা নির্বাচন করুন"><option>জেলা নির্বাচন করুন</option>{(division === 'ঢাকা' ? ['ঢাকা', 'গাজীপুর', 'নারায়ণগঞ্জ', 'নরসিংদী', 'মানিকগঞ্জ'] : division === 'রংপুর' ? ['রংপুর', 'দিনাজপুর', 'কুড়িগ্রাম', 'গাইবান্ধা', 'লালমনিরহাট'] : ['প্রথমে বিভাগ বেছে নিন']).map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
              <label><span className="sr-only">উপজেলা বা এলাকা</span><select value={area} onChange={(event) => setArea(event.target.value)} aria-label="উপজেলা/এলাকা"><option>উপজেলা/এলাকা</option><option>নিকটবর্তী</option><option>সদর</option>{district !== 'জেলা নির্বাচন করুন' && <option>{district} শহর</option>}</select><ChevronDown size={14} /></label>
            </div>
          </div>

          <div className="feed-filter-section">
            <h3><Grid2X2 size={18} /> ক্যাটাগরি <small>(একাধিক নির্বাচন করা যাবে)</small></h3>
            <div className="feed-category-grid">
              {categories.map(({ name, icon: Icon }) => <button key={name} type="button" className={selectedCategories.includes(name) ? 'selected' : ''} aria-pressed={selectedCategories.includes(name)} onClick={() => toggleCategory(name)}><Icon size={21} /><span>{name}</span>{selectedCategories.includes(name) && <Check size={15} className="category-check" />}</button>)}
            </div>
          </div>

          <div className="feed-filter-section">
            <h3><Radio size={18} /> মূল্য সীমা (৳)</h3>
            <div className="feed-price-range"><label><span className="sr-only">সর্বনিম্ন মূল্য</span><input inputMode="numeric" type="number" min="0" placeholder="সর্বনিম্ন" value={minimum} onChange={(event) => setMinimum(event.target.value)} /></label><span>—</span><label><span className="sr-only">সর্বোচ্চ মূল্য</span><input inputMode="numeric" type="number" min="0" placeholder="সর্বোচ্চ" value={maximum} onChange={(event) => setMaximum(event.target.value)} /></label></div>
          </div>

          <div className="feed-filter-section feed-post-type">
            <h3><BriefcaseBusiness size={18} /> পোস্টের ধরন</h3>
            <div>{postFilters.map((item) => <label key={item}><input type="checkbox" checked={postTypes.includes(item)} onChange={(event) => {
              const checked = event.currentTarget.checked;
              setPostTypes((current) => {
                if (item === 'সব পোস্ট') return checked ? ['সব পোস্ট'] : [];
                const selected = current.filter((value) => value !== 'সব পোস্ট');
                return checked ? [...selected, item] : selected.filter((value) => value !== item);
              });
            }} /><span>{item}</span></label>)}</div>
          </div>

          <div className="feed-filter-actions"><button type="button" className="hub-button hub-button-outline" onClick={resetFilters}><RotateCcw size={16} /> রিসেট</button><button type="button" className="hub-button" onClick={closeFilters}>ফলাফল দেখুন (০টি) <Search size={17} /></button></div>
        </section>
      </div>}
    </div>
  );
}
