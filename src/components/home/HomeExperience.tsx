'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight, Bell, CalendarDays, ChevronDown, ChevronRight, FileText,
  Flame, Grid2X2, Heart, MapPin, Megaphone, Radio, SlidersHorizontal, Tag,
} from 'lucide-react';
import BangladeshLiveClock from '@/components/BangladeshLiveClock';
import DirectorySearch from '@/components/search/DirectorySearch';
import { featuredModuleSlugs, modules } from '@/lib/modules';

const quickActions = [
  { label: 'ঘোষণা', icon: Megaphone, href: '/modules/advertising-center' },
  { label: 'আবেদন', icon: FileText, href: '/modules/my-dashboard' },
  { label: 'ইভেন্ট', icon: CalendarDays, href: '/modules/anusthan' },
  { label: 'অফার', icon: Tag, href: '/modules/amar-chahida' },
  { label: 'প্রিয়', icon: Heart, href: '/account?tab=saved' },
  { label: 'সব সেবা', icon: Grid2X2, href: '/modules' },
];

const feedFilters = ['সব পোস্ট', 'চাকরি', 'টিউশন', 'পণ্য', 'সেবা', 'অফার', 'শিক্ষা'];

const slides = [
  { first: 'বাংলাদেশের', second: 'সব প্রয়োজনে', third: 'এক প্ল্যাটফর্ম!', checks: ['খুঁজুন', 'সংযুক্ত হন', 'শিখুন', 'আয় করুন'] },
  { first: 'আপনার এলাকার', second: 'প্রয়োজনীয় সেবা', third: 'হাতের নাগালে!', checks: ['দোকান', 'শিক্ষা', 'চাকরি', 'সহায়তা'] },
  { first: 'এক জায়গায়', second: 'কাজ ও সুযোগ', third: 'সহজে খুঁজুন!', checks: ['ব্রাউজ', 'আবেদন', 'যোগাযোগ', 'এগিয়ে যান'] },
  { first: 'সহজ হাব BD', second: 'আপনার পাশে', third: 'প্রতিদিন!', checks: ['স্থানীয়', 'নিরাপদ', 'সহজ', 'বাংলাদেশ'] },
];

export default function HomeExperience({ enabledModuleKeys }: { enabledModuleKeys: string[] }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [category, setCategory] = useState('সব ক্যাটাগরি');
  const [district, setDistrict] = useState('সারা বাংলাদেশ');
  const [feedFilter, setFeedFilter] = useState('সব পোস্ট');
  const [trending, setTrending] = useState(false);
  const featured = useMemo(() => featuredModuleSlugs.map((slug) => modules.find((item) => item.slug === slug)).filter((item) => item !== undefined), []);
  const visibleFeatured = featured.filter((item) => category === 'সব ক্যাটাগরি' || item.category === category);
  const orderedFeatured = trending ? visibleFeatured.slice(0, 5) : visibleFeatured;
  const slide = slides[slideIndex];

  return (
    <div className="home-content hub-width">
      <section className="home-search-stack" aria-label="প্রধান সার্চ ও ফিল্টার">
        <DirectorySearch compact />
        <div className="filter-row">
          <div className="filter-wrap">
            <button type="button" className="filter-pill" aria-label="এলাকা বেছে নিন" aria-expanded={locationOpen} onClick={() => { setLocationOpen(!locationOpen); setFilterOpen(false); }}>
              <MapPin size={17} className="gold-icon" /><span>{district}</span><ChevronDown size={15} />
            </button>
            {locationOpen && <div className="filter-popover" role="group" aria-label="এলাকা বেছে নিন">
              {['সারা বাংলাদেশ', 'ঢাকা', 'চট্টগ্রাম', 'রংপুর', 'রাজশাহী', 'খুলনা', 'সিলেট'].map((place) => <button type="button" key={place} onClick={() => { setDistrict(place); setLocationOpen(false); }}>{place}</button>)}
            </div>}
          </div>
          <div className="filter-wrap">
            <button type="button" className="filter-pill" aria-label="ক্যাটাগরি বেছে নিন" aria-expanded={filterOpen} onClick={() => { setFilterOpen(!filterOpen); setLocationOpen(false); }}>
              <Grid2X2 size={16} className="gold-icon" /><span>{category}</span><ChevronDown size={15} />
            </button>
            {filterOpen && <div className="filter-popover" role="group" aria-label="ক্যাটাগরি বেছে নিন">
              {['সব ক্যাটাগরি', 'চাকরি', 'শিক্ষা', 'পণ্য', 'সেবা', 'ব্যবসা', 'টুলস'].map((item) => <button type="button" key={item} onClick={() => { setCategory(item); setFilterOpen(false); }}>{item}</button>)}
            </div>}
          </div>
          <button type="button" className="filter-pill filter-pill-compact" onClick={() => { setFilterOpen(!filterOpen); setLocationOpen(false); }}><SlidersHorizontal size={18} className="gold-icon" /><span>ফিল্টার</span></button>
          <button type="button" className={`filter-pill filter-pill-compact ${trending ? 'filter-active' : ''}`} aria-pressed={trending} onClick={() => setTrending(!trending)}><Flame size={17} className="gold-icon" /><span>ট্রেন্ডিং</span></button>
        </div>
      </section>

      <div className="ticker" aria-label="সর্বশেষ আপডেট">
        <span className="ticker-live"><i /> লাইভ</span><span className="ticker-clock"><BangladeshLiveClock compact /></span>
        <div className="ticker-window"><div className="ticker-track"><span>নতুন চাকরি বিজ্ঞপ্তি</span><b>•</b><span>ভর্তি আপডেট</span><b>•</b><span>বিশেষ অফার</span><b>•</b><span>শিক্ষা তথ্য</span><b>•</b><span>নতুন চাকরি বিজ্ঞপ্তি</span><b>•</b><span>ভর্তি আপডেট</span></div></div>
        <button type="button" className="ticker-next" aria-label="পরের আপডেট" onClick={(event) => { const track = event.currentTarget.parentElement?.querySelector('.ticker-track'); track?.classList.toggle('ticker-paused'); }}><ChevronRight size={22} /></button>
      </div>

      <section className="hero-banner" aria-label="সহজ হাব BD পরিচিতি">
        <h1 className="sr-only">সহজ হাব BD</h1>
        <div className="hero-landscape" aria-hidden="true"><span className="hero-sun" /><span className="hero-memorial"><i /><i /><i /></span><span className="hero-flag"><i /></span><span className="hero-horizon" /></div>
        <div className="hero-copy">
          <p>{slide.first}</p><p>{slide.second}</p><strong>{slide.third}</strong>
          <div className="hero-checks">{slide.checks.map((item) => <span key={item}><b>✓</b>{item}</span>)}</div>
        </div>
        <div className="hero-dots" role="group" aria-label="ব্যানার স্লাইড বেছে নিন">{slides.map((item, index) => <button key={item.third} type="button" aria-label={`স্লাইড ${index + 1}`} aria-pressed={slideIndex === index} className={slideIndex === index ? 'selected' : ''} onClick={() => setSlideIndex(index)} />)}</div>
      </section>

      <nav className="quick-actions" aria-label="দ্রুত সেবা">
        {quickActions.map(({ label, icon: Icon, href }) => <Link href={href} className="quick-action" key={label}><Icon size={25} aria-hidden /><span>{label}</span></Link>)}
      </nav>

      <section className="featured-section" aria-labelledby="featured-title">
        <div className="section-heading"><h2 id="featured-title"><Grid2X2 size={22} className="gold-icon" /> আমাদের প্রধান মডিউলসমূহ</h2><Link href="/modules">সব মডিউল দেখুন <ChevronRight size={20} /></Link></div>
        <div className="featured-grid">
          {orderedFeatured.map((item) => {
            if (!item) return null;
            const enabled = !item.enabledKey || enabledModuleKeys.includes(item.enabledKey);
            return <Link href={`/modules/${item.slug}`} key={item.slug} className={`module-card tone-${item.tone}`} aria-label={`${item.name}: ${item.title}${enabled ? '' : ', প্রস্তুত হচ্ছে'}`}>
              <span className="module-card-icon" aria-hidden>{item.icon}</span><strong>{item.name}</strong><span>{item.title}</span>
              {item.enabledKey && !enabled && <small>প্রস্তুত হচ্ছে</small>}
            </Link>;
          })}
        </div>
      </section>

      <section className="live-feed" aria-labelledby="live-feed-title">
        <div className="section-heading"><h2 id="live-feed-title"><Radio size={23} className="gold-icon live-radio" /> লাইভ ফিড <span>(সর্বশেষ আপডেট)</span></h2><button type="button" onClick={() => document.getElementById('feed-filters')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>আরও দেখুন <ChevronRight size={20} /></button></div>
        <div className="feed-filters" id="feed-filters" role="group" aria-label="ফিডের ধরন বেছে নিন">
          {feedFilters.map((item) => <button type="button" key={item} className={feedFilter === item ? 'active' : ''} aria-pressed={feedFilter === item} onClick={() => setFeedFilter(item)}>{item}</button>)}
        </div>
        <div className="feed-empty">
          <span className="feed-empty-icon"><Bell size={21} /></span>
          <div><strong>এখনো কোনো {feedFilter === 'সব পোস্ট' ? 'নতুন পোস্ট' : feedFilter + ' পোস্ট'} নেই</strong><p>প্রকাশিত ও যাচাইকৃত পোস্ট এলে এখানে দেখাবে।</p></div>
          <Link href="/modules" aria-label="সব মডিউল দেখুন"><ArrowRight size={19} /></Link>
        </div>
      </section>

      <div className="home-bottom-space" aria-hidden="true" />
    </div>
  );
}
