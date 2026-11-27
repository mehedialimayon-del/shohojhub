import Link from 'next/link';
import { ArrowUpRight, GraduationCap, Search, UserRound } from 'lucide-react';
import BangladeshLiveClock from '@/components/BangladeshLiveClock';
import ShohojHubLogo from '@/components/brand/ShohojHubLogo';
import UniversitySearch from '@/components/search/UniversitySearch';

export default function HomePage() {
  return (
    <>
      <header className="hub-header">
        <nav className="hub-width flex items-center justify-between gap-4" aria-label="প্রধান নেভিগেশন">
          <Link href="/" aria-label="সহজ হাব হোম"><ShohojHubLogo size="sm" showBanglaSubtitle /></Link>
          <div className="flex items-center gap-5">
            <Link href="#search" className="hidden items-center gap-2 sm:flex"><Search size={16} /> খুঁজুন</Link>
            <Link href="/account" className="hub-button hub-button-outline"><UserRound size={17} /> অ্যাকাউন্ট</Link>
          </div>
        </nav>
      </header>
      <main className="hub-width pb-24">
        <section className="hub-hero">
          <div className="hub-clock"><span aria-hidden="true" /><BangladeshLiveClock /></div>
          <h1>সহজ হাব<span className="hub-accent"> BD</span></h1>
          <p>বাংলাদেশের বিশ্ববিদ্যালয় খুঁজুন নাম বা জেলা দিয়ে।</p>
          <UniversitySearch />
        </section>
        <section className="mt-12" aria-labelledby="education-title">
          <h2 className="mb-4 text-xl font-bold" id="education-title">শিক্ষা</h2>
          <Link href="#search" className="hub-card flex items-center gap-4">
            <span className="hub-icon"><GraduationCap size={23} /></span>
            <span className="grow"><strong className="block">বাংলাদেশের বিশ্ববিদ্যালয়</strong><span className="text-sm text-neutral-300">যাচাইকৃত ডিরেক্টরি খুঁজুন</span></span>
            <ArrowUpRight size={20} className="hub-accent" aria-hidden />
          </Link>
        </section>
      </main>
      <footer className="hub-width hub-footer">ShohojHub BD</footer>
    </>
  );
}
