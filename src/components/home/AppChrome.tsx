'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { Bell, Grid2X2, Home, Menu, PenSquare, Search, UserRound, X } from 'lucide-react';

export default function AppChrome({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2800);
  }

  return (
    <div className="hub-app">
      <header className="app-header">
        <div className="app-header-inner">
          <button className="round-tool" type="button" aria-label={menuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <Link href="/" className="brand-lockup" aria-label="সহজ হাব BD হোম">
            <Image src="/brand/shohojhub-emblem.png" alt="সহজ হাব BD প্রতীক" width={68} height={68} priority className="brand-emblem" />
            <span className="brand-copy"><strong><span>সহজ</span> হাব <i>BD</i></strong><small>বাংলাদেশের সব প্রয়োজনে এক প্ল্যাটফর্ম</small></span>
          </Link>
          <div className="header-actions">
            <button className="round-tool notice-button" type="button" aria-label="নোটিফিকেশন" onClick={() => showNotice('নতুন নোটিফিকেশন এলে এখানে দেখাবে।')}>
              <Bell size={20} /><span className="notice-dot" />
            </button>
            <Link href="/account" className="round-tool" aria-label="অ্যাকাউন্ট"><UserRound size={20} /></Link>
          </div>
        </div>
      </header>

      {menuOpen && <div className="menu-scrim" onClick={() => setMenuOpen(false)}>
        <nav className="drawer" aria-label="প্রধান মেনু" onClick={(event) => event.stopPropagation()}>
          <div className="drawer-heading"><strong>সহজ হাব BD</strong><button className="icon-only" type="button" onClick={() => setMenuOpen(false)} aria-label="বন্ধ করুন"><X size={20} /></button></div>
          <Link href="/" onClick={() => setMenuOpen(false)}>হোম</Link>
          <Link href="/modules" onClick={() => setMenuOpen(false)}>সব ৪০টি মডিউল</Link>
          <Link href="/account" onClick={() => setMenuOpen(false)}>অ্যাকাউন্ট</Link>
        </nav>
      </div>}

      <main className="app-main" id="main-content">{children}</main>

      <nav className="bottom-dock" aria-label="নিচের নেভিগেশন">
        <Link href="/" className="dock-item"><Home size={23} /><span>হোম</span></Link>
        <Link href="/modules" className="dock-item"><Grid2X2 size={23} /><span>মডিউল</span></Link>
        <Link href="/#search" className="dock-search" aria-label="খুঁজুন"><Search size={31} /><span>খুঁজুন</span></Link>
        <Link href="/account?intent=create" className="dock-item"><PenSquare size={23} /><span>পোস্ট করুন</span></Link>
        <Link href="/account" className="dock-item"><UserRound size={23} /><span>আমার</span></Link>
      </nav>
      {notice && <div className="hub-toast" role="status">{notice}</div>}
    </div>
  );
}
