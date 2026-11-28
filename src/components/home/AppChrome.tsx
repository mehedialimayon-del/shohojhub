'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { ArrowLeft, Bell, BookOpen, BriefcaseBusiness, GraduationCap, Grid2X2, Handshake, Heart, Home, MapPin, Menu, MessageCircle, PenSquare, Play, Radio, Search, Settings, Smartphone, Tag, UserRound, Wallet, Wrench, X } from 'lucide-react';

const desktopNav = [
  ['হোম', '/', Home], ['ক্যাটাগরি', '/modules', Grid2X2], ['সেবা', '/feed?category=services', Handshake],
  ['ডিলস', '/feed?category=deals', Tag], ['শিক্ষা', '/modules/examarena-bd', GraduationCap],
  ['চাকরি', '/jobs', BriefcaseBusiness], ['টুলস', '/modules/shohojtools', Wrench],
  ['ব্লগ', '/modules/success-stories', BookOpen],
] as const;

const sidebarNav = [
  ['হোম', '/', Home], ['সব ক্যাটাগরি', '/modules', Grid2X2], ['কাছাকাছি', '/nearby', MapPin],
  ['আমার ড্যাশবোর্ড', '/dashboard', UserRound], ['প্রিয়', '/account?tab=saved', Heart],
  ['পেমেন্ট ও ওয়ালেট', '/modules/credit-center', Wallet], ['আমার পোস্ট', '/posts/manage', PenSquare],
  ['Shohoj Connect', '/connect', MessageCircle], ['নোটিফিকেশন', '/notifications', Bell], ['সেটিংস', '/account', Settings],
] as const;

export default function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFeed = pathname.startsWith('/feed');
  const isHome = pathname === '/';
  const fixedListings = ['/jobs','/tuition','/nearby'].includes(pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={`hub-app${isHome ? ' hub-home-app reference-home-shell' : (isFeed || fixedListings) ? ' fixed-listing-shell' : ''}`} onPointerDownCapture={event => {
      if (pathname !== '/' || !(event.target instanceof Element)) return;
      const control = event.target.closest('button:not(:disabled),a[href]');
      control?.animate([
        { boxShadow: '0 0 14px #ffc85d, inset 0 0 12px #ff8900b3' },
        { boxShadow: '0 0 0 #ff890000, inset 0 0 0 #ff890000' },
      ], { duration: 420, easing: 'ease-out' });
    }}>
      <header className="app-header">
        {isFeed ? <div className="app-header-inner feed-app-header">
          <Link href="/" className="round-tool" aria-label="হোমে ফিরুন"><ArrowLeft size={21} /></Link>
          <div className="feed-page-brand"><Radio size={26} /><span><h1>লাইভ ফিড</h1><small>সর্বশেষ পোস্ট, অফার ও সুযোগ</small></span></div>
          <Link className="round-tool notice-button" href="/notifications" aria-label="নোটিফিকেশন">
            <Bell size={20} />
          </Link>
        </div> : <div className="app-header-inner">
          <button className="round-tool mobile-menu-button" type="button" aria-label={menuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <Link href="/" className="brand-lockup" aria-label="সহজ হাব BD হোম">
            <Image src="/brand/shohojhub-pin.png" alt="" width={42} height={54} priority className="brand-pin" />
            <Image src="/brand/shohojhub-wordmark.png" alt="সহজ হাব BD — One Platform, Every Need" width={190} height={72} priority className="brand-wordmark" />
          </Link>
          <nav className="desktop-main-nav" aria-label="ডেস্কটপ নেভিগেশন">
            {desktopNav.map(([label, href, Icon]) => <Link href={href} key={label} aria-current={pathname === href ? 'page' : undefined}><Icon aria-hidden /><span>{label}</span></Link>)}
          </nav>
          <div className="header-actions">
            <Link href="/#search" className="round-tool desktop-search-shortcut" aria-label="সার্চে যান"><Search size={20} /></Link>
            <Link className="round-tool notice-button" href="/notifications" aria-label="নোটিফিকেশন"><Bell size={20} /></Link>
            <Link href="/account" className="round-tool" aria-label="অ্যাকাউন্ট"><UserRound size={20} /></Link>
          </div>
        </div>}
      </header>

      {!isFeed && !fixedListings && <aside className="desktop-sidebar">
        <nav aria-label="ডেস্কটপ সাইডবার">
          {sidebarNav.map(([label, href, Icon]) => <Link href={href} key={label} aria-current={pathname === href ? 'page' : undefined}><Icon aria-hidden /><span>{label}</span></Link>)}
        </nav>
        <section className="desktop-app-card">
          <strong>সহজ হাব BD অ্যাপ</strong>
          <div className="app-store-panel">
            <Smartphone aria-hidden />
            <div><span aria-disabled="true"><Play aria-hidden /> Google Play</span><span aria-disabled="true"><Smartphone aria-hidden /> App Store</span></div>
          </div>
          <p>স্টোরে প্রকাশের পর ডাউনলোড লিংক পাওয়া যাবে।</p>
          <Link href="/?banner=2" className="hub-button hub-button-outline">অ্যাপ ও ডাউনলোডের তথ্য</Link>
        </section>
      </aside>}

      {menuOpen && <div className="menu-scrim" onClick={() => setMenuOpen(false)}>
        <nav className="drawer" aria-label="প্রধান মেনু" onClick={(event) => event.stopPropagation()}>
          <div className="drawer-heading"><strong>সহজ হাব BD</strong><button className="icon-only" type="button" onClick={() => setMenuOpen(false)} aria-label="বন্ধ করুন"><X size={20} /></button></div>
          <Link href="/" onClick={() => setMenuOpen(false)}>হোম</Link>
          <Link href="/modules" onClick={() => setMenuOpen(false)}>সব ৪০টি মডিউল</Link>
          <Link href="/account" onClick={() => setMenuOpen(false)}>অ্যাকাউন্ট</Link>
          <Link href="/dashboard" onClick={() => setMenuOpen(false)}>আমার ড্যাশবোর্ড</Link>
          <Link href="/nearby" onClick={() => setMenuOpen(false)}>কাছাকাছি</Link>
          <Link href="/connect" onClick={() => setMenuOpen(false)}>Shohoj Connect</Link>
        </nav>
      </div>}

      <div className={isFeed || fixedListings ? 'app-main' : 'app-main has-desktop-sidebar'} id="main-content">{children}</div>

      <nav className="bottom-dock" aria-label="নিচের নেভিগেশন">
        <Link href="/" aria-current={pathname === '/' ? 'page' : undefined} className="dock-item"><Home size={23} /><span>হোম</span></Link>
        <Link href="/modules" aria-current={pathname.startsWith('/modules') ? 'page' : undefined} className="dock-item"><Grid2X2 size={23} /><span>মডিউল</span></Link>
        <Link href="/nearby" className="dock-search" aria-label="খুঁজুন" aria-current={pathname === '/nearby' ? 'page' : undefined}><span className="dock-search-icon"><Search aria-hidden /></span><span>খুঁজুন</span></Link>
        <Link href="/posts/new" aria-current={pathname === '/posts/new' ? 'page' : undefined} className="dock-item"><PenSquare size={23} /><span>পোস্ট করুন</span></Link>
        <Link href="/dashboard" aria-current={pathname === '/dashboard' ? 'page' : undefined} className="dock-item"><UserRound size={23} /><span>আমার</span></Link>
      </nav>
    </div>
  );
}
