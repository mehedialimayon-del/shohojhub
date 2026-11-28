'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight, Bell, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, FileText,
  BookOpen, BriefcaseBusiness, ChartNoAxesCombined, Clock3, Coins, Cpu, Flame, Globe2, GraduationCap, Grid2X2, Heart,
  House, Laptop, MapPin, Megaphone, Pause, Play, Radio, ShieldCheck, ShoppingCart, SlidersHorizontal, Store, Tag, Trophy, Wrench,
} from 'lucide-react';
import Image from 'next/image';
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

const featuredIcons = {
  chaikini: ShoppingCart, haatbazar: Store, porai: GraduationCap, 'examarena-bd': BookOpen,
  'an-overseas': Globe2, chakrichai: BriefcaseBusiness, shebachai: Wrench, varachai: House,
  'stock-manager': ChartNoAxesCombined, 'success-stories': Trophy,
  'shohojtools': BookOpen, 'ai-assistant': Cpu, 'referral-rewards': Coins, kajchai: BriefcaseBusiness,
};
const desktopFeatured = ['shohojtools', 'ai-assistant', 'referral-rewards', 'kajchai'];

const slides = [
  { first: 'বাংলাদেশের', second: 'সব প্রয়োজনে', third: 'এক প্ল্যাটফর্ম!', checks: ['খুঁজুন', 'সংযুক্ত হন', 'শিখুন', 'আয় করুন'], href: '/modules', link: 'সব সেবা' },
  { first: 'আপনার এলাকার', second: 'প্রয়োজনীয় সেবা', third: 'হাতের নাগালে!', checks: ['দোকান', 'শিক্ষা', 'চাকরি', 'সহায়তা'], href: '/nearby', link: 'কাছাকাছি খুঁজুন' },
  { first: 'এক জায়গায়', second: 'কাজ ও সুযোগ', third: 'সহজে খুঁজুন!', checks: ['ব্রাউজ', 'আবেদন', 'যোগাযোগ', 'এগিয়ে যান'], href: '/feed?category=jobs', link: 'চাকরি দেখুন' },
  { first: 'সহজ হাব BD', second: 'সর্বশেষ অফার', third: 'এক নজরে!', checks: ['স্থানীয়', 'সহজে খুঁজুন'], href: '/feed?category=deals', link: 'অফার দেখুন' },
];

type RecentPost = { id: string; category: string; title: string; division: string; district: string; area: string | null; price_min_paisa: number | null; price_max_paisa: number | null; published_at: string | null; has_photo: boolean };
const taka = new Intl.NumberFormat('bn-BD');

function postPrice({ price_min_paisa: min, price_max_paisa: max }: RecentPost) {
  if (min === null && max === null) return '';
  const first = taka.format((min ?? max ?? 0) / 100);
  return '৳ ' + (min !== null && max !== null && max !== min ? `${first} – ${taka.format(max / 100)}` : first);
}
export default function HomeExperience({ initialSlide, enabledModuleKeys, recentPosts }: { initialSlide: number; enabledModuleKeys: string[]; recentPosts: RecentPost[] }) {
  const [slideIndex, setSlideIndex] = useState(initialSlide);
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [category, setCategory] = useState('সব ক্যাটাগরি');
  const [district, setDistrict] = useState('সারা বাংলাদেশ');
  const [trending, setTrending] = useState(false);
  const [tickerPaused, setTickerPaused] = useState(false);
  const featured = useMemo(() => [...featuredModuleSlugs, ...desktopFeatured].map((slug) => modules.find((item) => item.slug === slug)).filter((item) => item !== undefined), []);
  const visibleFeatured = featured.filter((item) => category === 'সব ক্যাটাগরি' || item.category === category);
  const orderedFeatured = trending ? visibleFeatured.slice(0, 5) : visibleFeatured;
  const slide = slides[slideIndex];

  return (
    <main className="home-content hub-width">
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
          <Link href="/feed?filters=1" className="filter-pill filter-pill-compact"><SlidersHorizontal size={18} className="gold-icon" aria-hidden />ফিল্টার</Link>
          <button type="button" className={`filter-pill${trending ? ' filter-active' : ''}`}
            aria-pressed={trending} onClick={() => setTrending(on => !on)}>
            <Flame size={16} className="gold-icon" aria-hidden /> ট্রেন্ডিং
          </button>
        </div>
      </section>

      <div className="ticker" aria-label="সর্বশেষ আপডেট">
        <span className="ticker-live"><i /> লাইভ</span><span className="ticker-clock"><BangladeshLiveClock compact /></span>
        <div className="ticker-window"><div className={`ticker-track${tickerPaused ? ' ticker-paused' : ''}`}><span>নতুন চাকরি বিজ্ঞপ্তি</span><b>•</b><span>ভর্তি আপডেট</span><b>•</b><span>বিশেষ অফার</span><b>•</b><span>শিক্ষা তথ্য</span><b>•</b><span>নতুন চাকরি বিজ্ঞপ্তি</span><b>•</b><span>ভর্তি আপডেট</span></div></div>
        <button type="button" className="ticker-next" aria-label={tickerPaused ? 'টিকার চালু করুন' : 'টিকার থামান'}
          onClick={() => setTickerPaused(paused => !paused)}>
          {tickerPaused ? <Play size={18} /> : <Pause size={18} />}
        </button>
      </div>

      <section className="hero-banner" aria-label="সহজ হাব BD পরিচিতি">
        <h1 className="sr-only">সহজ হাব BD</h1>
        {slideIndex === 0
          ? <div className="hero-reference-art" aria-hidden="true" />
          : <div className="hero-landscape" aria-hidden="true"><span className="hero-sun" /><span className="hero-memorial"><i /><i /><i /></span><span className="hero-flag"><i /></span><span className="hero-horizon" /></div>}
        <div className="hero-copy">
          <p>{slide.first}</p><p>{slide.second}</p><strong>{slide.third}</strong>
          <div className="hero-checks">{slide.checks.map((item) => <span key={item}><b>✓</b>{item}</span>)}</div>
        </div>
        <button className="hero-arrow hero-prev" type="button" aria-label="আগের ব্যানার" onClick={() => setSlideIndex((slideIndex + slides.length - 1) % slides.length)}><ChevronLeft /></button>
        <button className="hero-arrow hero-next" type="button" aria-label="পরের ব্যানার" onClick={() => setSlideIndex((slideIndex + 1) % slides.length)}><ChevronRight /></button>
        <Link className="hero-cta" href={slide.href}>{slide.link} <ArrowRight size={15} /></Link>
        <div className="hero-dots" role="group" aria-label="ব্যানার স্লাইড বেছে নিন">{slides.map((item, index) => <button key={item.third} type="button" aria-label={`স্লাইড ${index + 1}`} aria-pressed={slideIndex === index} className={slideIndex === index ? 'selected' : ''} onClick={() => setSlideIndex(index)} />)}</div>
      </section>

      <section className="desktop-home-promo" aria-label="সহজ হাবের সেবা">
        <div><strong>চাকরি, শিক্ষা, ব্যবসা, সেবা ও দৈনন্দিন জীবন</strong><span>এখন এক জায়গায়</span><Link href="/modules">সহজ হাব BD <ArrowRight size={20} /></Link></div>
        <div className="desktop-promo-art" aria-hidden><Laptop /><span><Store /><GraduationCap /><BriefcaseBusiness /></span></div>
      </section>

      <nav className="quick-actions" aria-label="দ্রুত সেবা">
        {quickActions.map(({ label, icon: Icon, href }) => <Link href={href} className="quick-action" key={label}><Icon size={25} aria-hidden /><span>{label}</span></Link>)}
      </nav>

      <section className="featured-section" aria-labelledby="featured-title">
        <div className="section-heading"><h2 id="featured-title"><Grid2X2 size={22} className="gold-icon" /> আমাদের প্রধান মডিউলসমূহ</h2><Link href="/modules">সব মডিউল দেখুন <ChevronRight size={20} /></Link></div>
        <div className="featured-grid">
          {orderedFeatured.map((item) => {
            if (!item) return null;
            const enabled = Boolean(item.enabledKey && enabledModuleKeys.includes(item.enabledKey));
            const Icon = featuredIcons[item.slug as keyof typeof featuredIcons];
            return <Link href={`/modules/${item.slug}`} key={item.slug} className={`module-card tone-${item.tone}${desktopFeatured.includes(item.slug) ? ' desktop-only-module' : ''}`} aria-label={`${item.name}: ${item.title}${enabled ? '' : ', প্রস্তুত হচ্ছে'}`}>
              <span className="module-card-icon" aria-hidden>{Icon ? <Icon /> : item.icon}</span><strong>{item.name}</strong><span>{item.title}</span>
            </Link>;
          })}
        </div>
      </section>

      <section className="live-feed" aria-labelledby="live-feed-title">
        <div className="section-heading"><h2 id="live-feed-title"><Radio size={23} className="gold-icon live-radio" /> লাইভ ফিড <span>(সর্বশেষ আপডেট)</span></h2><Link href="/feed">আরও দেখুন <ChevronRight size={20} /></Link></div>
        <div className="feed-filters" id="feed-filters" role="group" aria-label="ফিডের ধরন বেছে নিন">
          {feedFilters.map((item) => <Link key={item} href={item === 'সব পোস্ট' ? '/feed' : `/feed?category=${encodeURIComponent(item)}`} className={item === 'সব পোস্ট' ? 'active' : ''}>{item}</Link>)}
        </div>
        {recentPosts.length ? <div className="home-feed-posts">{recentPosts.map((post) => <Link key={post.id} href={`/posts/${post.id}`} className="home-feed-post">
          <span className="home-feed-post-icon">{post.has_photo ? <Image width={108} height={80} src={`/api/posts/${post.id}/photo`} unoptimized alt="" /> : <Bell size={21} />}</span>
          <span><b>{post.category === 'jobs' ? 'চাকরিচাই' : post.category === 'products' ? 'পণ্য' : post.category === 'tuition' ? 'পড়াই' : 'সহজ হাব'}</b>
            <strong>{post.title}</strong>
            <small><MapPin size={13} /> {[post.area, post.district].filter(Boolean).join(', ')}
              {post.published_at && <><Clock3 size={13} /><time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString('bn-BD', { timeZone: 'Asia/Dhaka' })}</time></>}
            </small>{postPrice(post) && <b className="home-feed-price">{postPrice(post)}</b>}
          </span><span className="home-feed-more">বিস্তারিত <ArrowRight size={15} /></span>
        </Link>)}</div> : <div className="feed-empty">
          <span className="feed-empty-icon"><Bell size={21} /></span>
          <div><strong>এখনো কোনো নতুন পোস্ট নেই</strong><p>প্রকাশিত ও যাচাইকৃত পোস্ট এলে এখানে দেখাবে।</p></div>
          <Link href="/feed" aria-label="লাইভ ফিড খুলুন"><ArrowRight size={19} /></Link>
        </div>}
      </section>

      <div className="home-post-actions flex flex-wrap gap-2 mt-3">
        <Link href="/posts/new?intent=need" className="hub-button">আমার প্রয়োজন</Link>
        <Link href="/posts/new?intent=offer" className="hub-button hub-button-outline">আমি সেবা দেব</Link>
      </div>

      <div className="desktop-home-links" aria-label="সহজ হাবের প্রয়োজনীয় লিংক">
        <strong>সহজ হাব BD</strong><Link href="/account"><ShieldCheck /> অ্যাকাউন্ট</Link><Link href="/nearby"><MapPin /> কাছাকাছি সেবা</Link>
        <Link href="/connect"><Bell /> Shohoj Connect</Link><Link href="/modules"><Grid2X2 /> সব মডিউল</Link>
      </div>

      <div className="home-bottom-space" aria-hidden="true" />
    </main>
  );
}
